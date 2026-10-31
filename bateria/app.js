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
  caixa: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="7" rx="9" ry="3"/><path d="M3 7v9c0 1.7 4 3 9 3s9-1.3 9-3V7c-1.4 1.6-5 2.6-9 2.6S4.4 8.6 3 7z" opacity=".6"/><path d="M6 10.5v6M10 11v7M14 11v7M18 10.5v6" stroke="currentColor" stroke-width="1.2"/></svg>',
  bumbo: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="5" fill="#0F1B2D" opacity=".55"/></svg>',
  chimbal: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="7" rx="9" ry="2.2"/><ellipse cx="12" cy="10.5" rx="9" ry="2.2" opacity=".7"/><rect x="11" y="12" width="2" height="10" rx="1"/></svg>',
  menu: '<svg viewBox="0 0 24 24"><rect x="4" y="6" width="16" height="2.2" rx="1.1"/><rect x="4" y="11" width="16" height="2.2" rx="1.1"/><rect x="4" y="16" width="16" height="2.2" rx="1.1"/></svg>',
  gravar: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6"/><path d="M12 2a10 10 0 110 20 10 10 0 010-20zm0 2a8 8 0 100 16 8 8 0 000-16z"/></svg>',
  lapis: '<svg viewBox="0 0 24 24"><path d="M4 17.2V20h2.8L17.3 9.5l-2.8-2.8zM19.7 7.1a1 1 0 000-1.4l-1.4-1.4a1 1 0 00-1.4 0l-1.2 1.2 2.8 2.8z"/></svg>',
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
  caixa: 'Caixa', bumbo: 'Bumbo', chimbal: 'Chimbal',
};
// primeira palavra depois do "!" que escolhe o tipo
const ALIAS = {
  sobe: 'sobe', subindo: 'sobe', subir: 'sobe', cresce: 'sobe', abre: 'sobe',
  desce: 'desce', desceu: 'desce', descendo: 'desce', leve: 'desce', baixa: 'desce',
  virada: 'virada', vira: 'virada', prato: 'prato', ataque: 'prato', crash: 'prato',
  corte: 'corte', corta: 'corte', conducao: 'conducao', ride: 'conducao',
  para: 'pausa', pausa: 'pausa', sai: 'pausa', entra: 'entra', nota: 'livre',
  caixa: 'caixa', bumbo: 'bumbo', chimbal: 'chimbal', 'hi-hat': 'chimbal',
};
function tipoDe(txt) {
  const t = semAcento(txt);
  if (/\b(corte|corta|parada seca)/.test(t)) return 'corte';
  if (/\bvirad/.test(t)) return 'virada';
  if (/\b(desc|baix|leve)/.test(t)) return 'desce';
  if (/\b(sub|cresc|cheio|abre)/.test(t)) return 'sobe';
  if (/\b(prato|ataque|crash)/.test(t)) return 'prato';
  if (/\b(conduc|ride)/.test(t)) return 'conducao';
  if (/\bcaixa/.test(t)) return 'caixa';
  if (/\bbumbo/.test(t)) return 'bumbo';
  if (/\b(chimbal|hi-?hat)/.test(t)) return 'chimbal';
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
    // "! nota olhar pro ministro" mostra só o recado
    if (tipo === 'livre' && r.length) return { tipo, txt: cap(r.join(' ')) };
    if (tipo) return { tipo, txt: cap(resto) };
    return { tipo: tipoDe(resto), txt: cap(resto) || 'Nota' };
  }
  const resto = l.replace(/^bateria\s*/i, '');
  return { tipo: tipoDe(resto || l), txt: cap(resto || l) };
}
// texto do editor -> itens. "#" = parte da música, "!" ou "Bateria..." = marcação, resto = letra
function interpretar(texto) {
  const itens = []; let n = 0;
  // r = número da linha no texto, para a edição rápida do palco saber onde mexer
  String(texto || '').split(/\r?\n/).forEach((bruta, r) => {
    const l = bruta.trim();
    if (!l) itens.push({ k: 'vazio', r });
    else if (l.startsWith('#')) itens.push({ k: 'secao', txt: l.replace(/^#+\s*/, ''), r });
    else if (ehDeixa(l)) itens.push({ k: 'deixa', ...lerDeixa(l), r });
    else itens.push({ k: 'linha', txt: l, i: n++, r });
  });
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
// endereço da música no Cifra Club (padrão artista/musica); o app não lê a página: o Cifra Club bloqueia
// acesso automático e os termos não deixam copiar a letra. O Lucas abre, copia e toca "Colar letra".
const slug = s => semAcento(String(s || '')).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
// busca que lista as versões da música no Cifra Club (original, simplificada, ao vivo, letra)
const buscaVersoes = (titulo, artista) =>
  'https://www.google.com/search?q=' + encodeURIComponent(`site:cifraclub.com.br ${titulo || ''} ${String(artista || '').split(',')[0]}`.trim());
// link de versão colado pelo Lucas: só aceita endereço do Cifra Club ou do Letras
function linkDeVersao(s) {
  try { const u = new URL(String(s || '').trim()); return /(^|\.)(cifraclub\.com\.br|letras\.mus\.br)$/.test(u.hostname) ? u.href : ''; }
  catch { return ''; }
}
function urlCifra(titulo, artista, link) {
  if (linkDeVersao(link)) return linkDeVersao(link);
  const principal = String(artista || '').split(/,|&|\s+e\s+|feat\.?|part\.?/i)[0].trim();
  if (titulo && principal) return `https://www.cifraclub.com.br/${slug(principal)}/${slug(titulo)}/`;
  return 'https://www.google.com/search?q=' + encodeURIComponent(`site:cifraclub.com.br ${titulo || ''} ${artista || ''}`.trim());
}
// lê o que foi copiado; se for cifra, tira os acordes
async function lerLetraCopiada() {
  let t = '';
  try { t = await navigator.clipboard.readText(); }
  catch { aviso('O navegador não deixou ler o que foi copiado. Toque e segure no campo da letra e escolha Colar.', 7000); return null; }
  if (!t.trim()) { aviso('Não tem nada copiado. Copie a cifra no Cifra Club e volte.'); return null; }
  const r = limparCifra(t);
  return r ? r.texto : t.trim();
}
// letra recém-colada sem nenhuma marcação: o app já escreve as da bateria pelo refrão
function letraComMarcacoes(texto) {
  if (interpretar(texto).itens.some(x => x.k === 'deixa')) return { texto, inseridas: 0 };
  const s = sugerirPelaLetra(texto);
  return s ? inserirDeixas(texto, s.sugestoes, s.finais) : { texto, inseridas: 0 };
}
const linhasDe = texto => interpretar(texto).itens.filter(x => x.k === 'linha').map(x => x.txt);
// põe "# nome" (ex.: Solo) acima da linha de letra k, das marcações dela e do nome de parte que já estiver ali.
// Se já houver um Solo/Instrumental logo acima, não repete.
function inserirSecaoAntes(texto, k, nome) {
  const linhas = String(texto || '').split('\n'); let n = 0, alvo = -1;
  for (let r = 0; r < linhas.length; r++) {
    const l = linhas[r].trim();
    if (l && !l.startsWith('#') && !ehDeixa(l)) { if (n === k) { alvo = r; break; } n++; }
  }
  if (alvo < 0) return texto;
  let pos = alvo; while (pos > 0 && ehDeixa(linhas[pos - 1].trim())) pos--;
  let q = pos - 1, cabeca = -1;
  while (q >= 0) {
    const t = linhas[q].trim();
    if (!t) { q--; continue; }
    if (t.startsWith('#')) { if (/solo|instrumental/i.test(t)) return texto; if (cabeca < 0) cabeca = q; q--; continue; }
    break;
  }
  if (cabeca >= 0) pos = cabeca; // já tem nome de parte (ex.: Refrão): o Solo entra acima dele
  const novo = []; if (pos > 0 && linhas[pos - 1].trim()) novo.push('');
  novo.push('# ' + nome);
  linhas.splice(pos, 0, ...novo);
  return linhas.join('\n');
}

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

// impressão digital de um objeto (chaves em ordem fixa): igual = mesmo conteúdo
function hashDe(v) {
  const est = x => Array.isArray(x) ? x.map(est) : x && typeof x === 'object'
    ? Object.fromEntries(Object.keys(x).sort().filter(k => x[k] !== undefined && k !== 'origem' && k !== 'temAudio').map(k => [k, est(x[k])])) : x;
  const s = JSON.stringify(est(v)); let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return s.length + ':' + (h >>> 0).toString(36);
}
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
    setTimeout(() => this.subirPendentes(), 0);
    if (!j.bateria) { await this.enviar(); return; }
    const b = j.bateria;
    if (dados.pendente) { this.mesclar(b); await this.enviar(); return; }
    dados.locais = Object.fromEntries((b.musicas || []).map(m => [m.id, m]));
    dados.listas = b.listas || [];
    dados.ocultas = b.ocultas || [];
    dados.listasApagadas = b.listasApagadas || dados.listasApagadas;
    trazerListasDoSite();
    this.anotarBase();
    gravarLocal();
  },
  // "foto" do que estava igual nos dois lados na última sincronização: serve para saber quem mudou o quê
  anotarBase() {
    dados.base = {};
    Object.values(dados.locais).forEach(m => { dados.base['m:' + m.id] = hashDe(m); });
    dados.listas.forEach(l => { dados.base['l:' + l.id] = hashDe(l); });
    dados.base.o = hashDe(dados.ocultas);
  },
  // este aparelho tem mudanças ainda não enviadas e o site também mudou: junta música por música.
  // Só pergunta quando a MESMA música (ou ensaio) foi mudada nos dois lados.
  mesclar(b) {
    const base = dados.base;
    if (!base) return; // sem referência (primeira vez com esta versão): vale o que está neste aparelho
    const conflitos = [];
    const juntar = (pref, locais, remotas, nome) => {
      const L = new Map(locais.map(x => [x.id, x])), R = new Map((remotas || []).map(x => [x.id, x]));
      const saida = [];
      for (const id of new Set([...L.keys(), ...R.keys(), ...Object.keys(base).filter(k => k.startsWith(pref)).map(k => k.slice(2))])) {
        const l = L.get(id), r = R.get(id), hl = l ? hashDe(l) : null, hr = r ? hashDe(r) : null, h0 = base[pref + id] ?? null;
        let fica;
        if (hl === hr) fica = l;
        else if (hl === h0) fica = r;          // só o site mudou
        else if (hr === h0) fica = l;          // só este aparelho mudou
        else if (!l || !r) fica = l || r;      // um apagou, o outro editou: a edição vale
        else { conflitos.push(nome(l)); fica = confirm(`"${nome(l)}" foi mudada neste aparelho e também em outro.\n\nOK = ficar com a versão DESTE aparelho\nCancelar = ficar com a versão do SITE`) ? l : r; }
        if (fica) saida.push(fica);
      }
      return saida;
    };
    const musicas = juntar('m:', Object.values(dados.locais), b.musicas, x => x.titulo || 'Sem nome');
    dados.locais = Object.fromEntries(musicas.map(m => [m.id, m]));
    dados.listas = juntar('l:', dados.listas, b.listas, x => x.nome || 'Ensaio');
    dados.ocultas = [...new Set([...(dados.ocultas || []), ...(b.ocultas || [])])];
    dados.listasApagadas = [...new Set([...(dados.listasApagadas || []), ...(b.listasApagadas || [])])];
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
      else { dados.pendente = false; this.anotarBase(); gravarLocal(); this.estado = 'ok'; }
    } catch { this.estado = 'offline'; }
    mostrarNuvem();
  },
  // mp3 vai em pedaços de 700 KB (o banco do site aceita pouco por vez); só baixa quem tem a senha
  async subirAudio(id, blob, aoProgresso) {
    const PED = 700 * 1024, total = Math.ceil(blob.size / PED);
    if (total > 200) throw new Error('grande demais');
    for (let i = 0; i < total; i++) {
      const d = await paraBase64(blob.slice(i * PED, (i + 1) * PED));
      const corpo = JSON.stringify({ key: 'audio', data: { id, i, total, tipo: blob.type || 'audio/mpeg', d } });
      // rede de celular oscila: cada pedaço tem 3 tentativas antes de desistir
      for (let t = 1; ; t++) {
        let falha = '';
        try {
          const r = await this.pedir('/api/admin/save', { method: 'POST', body: corpo });
          if (r.ok) break;
          falha = 'site respondeu ' + r.status;
          if (r.status === 401 || r.status === 413) throw new Error(falha); // repetir não adianta
        } catch (e) {
          if (/^site respondeu (401|413)/.test(e.message)) throw e;
          falha = falha || 'sem conexão';
        }
        if (t >= 3) throw new Error(falha + ` (pedaço ${i + 1} de ${total})`);
        await new Promise(ok => setTimeout(ok, 1500 * t));
      }
      if (aoProgresso) aoProgresso((i + 1) / total);
    }
  },
  async baixarAudio(id, aoProgresso) {
    const partes = []; let total = 1, tipo = 'audio/mpeg';
    for (let i = 0; i < total; i++) {
      const r = await this.pedir(`/api/admin/data?k=audio&id=${encodeURIComponent(id)}&i=${i}`);
      if (!r.ok) throw new Error('site respondeu ' + r.status);
      const j = await r.json();
      total = j.total; tipo = j.tipo || tipo;
      partes.push(deBase64(j.d));
      if (aoProgresso) aoProgresso((i + 1) / total);
    }
    return new Blob(partes, { type: tipo });
  },
  apagarAudio(id) {
    return this.pedir('/api/admin/save', { method: 'POST', body: JSON.stringify({ key: 'audio-apagar', data: { id } }) }).catch(() => {});
  },
  // mp3 escolhido antes de entrar com a senha: sobe agora
  async subirPendentes() {
    for (const m of Object.values(dados.locais)) {
      if (!m.audioSubir) continue;
      const blob = await Banco.get(m.id);
      if (blob) subirMp3(m, blob, t => { if (/guardado|Não deu/.test(t)) aviso(`${m.titulo}: ${t}`, 6000); });
      else anotarAudio(m.id, { audioSubir: undefined });
    }
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
function paraBase64(blob) {
  return new Promise((ok, erro) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result).slice(String(r.result).indexOf(',') + 1));
    r.onerror = () => erro(r.error);
    r.readAsDataURL(blob);
  });
}
function deBase64(s) {
  const bin = atob(s), u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}
// mp3 novo (do editor ou do palco): toca já neste aparelho, a análise preenche o que falta,
// e ele sobe para o site em segundo plano
async function receberMp3(m, arq, status) {
  await Banco.put(m.id, arq);
  if (status) status('Lendo a música…');
  try {
    const r = await analisarAudio(arq);
    Object.assign(m, { energia: r.energia, duracao: r.duracao, primeiroSom: r.primeiroSom });
    if (!m.bpm || m.bpmConferir) { m.bpm = r.bpm; m.bpmConferir = true; }
  } catch { /* sem análise o mp3 toca do mesmo jeito */ }
  m.audioNoSite = false; m.temAudio = true;
  guardar(m);
  subirMp3(m, arq, status);
}
// estado do mp3 de uma música ("no site", "subindo") muda em segundo plano: grava SÓ esses campos na
// música guardada e na que está aberta na tela. Gravar a música inteira apagava o que ele editou nesse meio tempo.
const subindo = {}; // id -> fração já enviada
function anotarAudio(id, campos) {
  const base = dados.locais[id] || (pegar(id) ? (({ origem, ...c }) => c)(pegar(id)) : null);
  if (!base) return;
  for (const [k, v] of Object.entries(campos)) { if (v === undefined) delete base[k]; else base[k] = v; }
  dados.locais[id] = base; salvar();
  if (P && P.m && P.m.id === id) for (const [k, v] of Object.entries(campos)) { if (v === undefined) delete P.m[k]; else P.m[k] = v; }
}
function subirMp3(m, arq, status) {
  const dizer = t => { if (status) status(t); };
  if (Nuvem.estado !== 'ok') {
    anotarAudio(m.id, { audioSubir: true });
    dizer('O mp3 já toca neste aparelho. Entre com a senha do painel para ele ir para o site.');
    return;
  }
  if (subindo[m.id] != null) return; // já está subindo
  subindo[m.id] = 0;
  dizer('Guardando o mp3 no site… 0%');
  Nuvem.subirAudio(m.id, arq, p => { subindo[m.id] = p; dizer(`Guardando o mp3 no site… ${Math.round(p * 100)}%`); })
    .then(() => { delete subindo[m.id]; anotarAudio(m.id, { audioNoSite: true, audioSubir: undefined }); dizer('mp3 guardado no site. Só abre com a sua senha.'); })
    .catch(e => { delete subindo[m.id]; anotarAudio(m.id, { audioSubir: true }); dizer(`Não deu para guardar o mp3 no site agora (${e && e.message ? e.message : 'erro'}). Ele toca aqui; tento de novo quando abrir o app.`); });
}
// a música diz em que pé está o mp3 dela
function estadoMp3(m, temNoAparelho) {
  if (subindo[m.id] != null) return `mp3 subindo para o site, ${Math.round(subindo[m.id] * 100)}%`;
  if (m.audioNoSite) return temNoAparelho ? 'mp3 no site e neste aparelho' : 'mp3 no site (baixa ao tocar)';
  if (m.audioSubir) return 'mp3 só neste aparelho, esperando subir para o site';
  return temNoAparelho ? 'mp3 só neste aparelho' : '';
}
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
  mem: new Map(), // mp3 já lido nesta abertura do app: trocar de música não lê o banco de novo
  abrir() {
    if (this.db) return Promise.resolve(this.db);
    // se o banco do navegador travar, desiste em 12 s: a tela segue sem o mp3 em vez de ficar parada
    return new Promise((ok, erro) => {
      const desiste = setTimeout(() => erro(new Error('banco do navegador não respondeu')), 12000);
      const r = indexedDB.open('mapabateria', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('audios');
      r.onsuccess = () => {
        clearTimeout(desiste);
        const db = this.db = r.result;
        // o celular fecha a conexão quando o app vai para o fundo: esquece a velha e abre outra na próxima
        db.onclose = db.onversionchange = () => { if (this.db === db) this.db = null; try { db.close(); } catch {} };
        ok(db);
      };
      r.onerror = () => { clearTimeout(desiste); erro(r.error); };
    });
  },
  async op(modo, fn, tentativa = 0) {
    try {
      const db = await this.abrir();
      return await new Promise((ok, erro) => {
        const tx = db.transaction('audios', modo);
        const r = fn(tx.objectStore('audios'));
        tx.oncomplete = () => ok(r && r.result);
        tx.onerror = tx.onabort = () => erro(tx.error || new Error('banco abortou'));
      });
    } catch (e) {
      if (tentativa >= 2) throw e;
      this.db = null; // conexão velha: abre outra e tenta de novo
      await new Promise(ok => setTimeout(ok, 300 * (tentativa + 1)));
      return this.op(modo, fn, tentativa + 1);
    }
  },
  async get(id) {
    if (this.mem.has(id)) return this.mem.get(id);
    const b = await this.op('readonly', s => s.get(id)).catch(() => null);
    if (b) this.mem.set(id, b);
    return b;
  },
  async put(id, blob) {
    this.mem.set(id, blob);
    await this.op('readwrite', s => s.put(blob, id));
    // pede ao celular para não apagar os mp3 guardados quando faltar espaço
    try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch {}
  },
  del(id) { this.mem.delete(id); return this.op('readwrite', s => s.delete(id)).catch(() => {}); },
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
// iPhone: som que passa pelo Web Audio (volume e clique) fica mudo com a chave do silencioso.
// "playback" diz ao iOS que isto é música, e aí toca mesmo no silencioso (Safari 16.4 ou mais novo).
try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch {}
// pede ao navegador para não apagar os mp3 guardados quando faltar espaço (o iPhone apaga dados de sites)
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch {}
const ehIphone = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
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
          // iPhone sem o recurso de música: toca direto (sem o volume do app, que use os botões do celular),
          // senão a chave do silencioso cala tudo
          if (ehIphone && !navigator.audioSession) throw 0;
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
        onError: () => { erro(new Error('vídeo indisponível')); aviso('O dono deste vídeo não deixa tocar fora do YouTube. Use o mp3 (Editar → Escolher mp3).', 9000); },
        onStateChange: e => { tocando = e.data === 1 || e.data === 3; if (e.data === 0) aoFim(); },
      },
    });
  });
}
// escolhe a fonte da música: mp3 guardado no aparelho > mp3 do site > YouTube
// a música toca pelo que o Lucas escolheu (m.fonte): 'youtube' só quando ele escolher; sem escolha, só mp3
async function abrirFonte(m, caixa) {
  if (m.fonte === 'youtube') return abrirYouTube(m, caixa);
  const blob = await Banco.get(m.id);
  if (blob) {
    const url = URL.createObjectURL(blob), f = fonteAudio(url), d = f.destruir;
    f.destruir = () => { d(); URL.revokeObjectURL(url); };
    return f;
  }
  if (m.audioNoSite && Nuvem.pronto) await Nuvem.pronto; // espera saber se está logado
  if (m.audioNoSite && Nuvem.estado !== 'desligada') {
    try {
      aviso('Baixando o mp3 do site…', 60000);
      const baixado = await Nuvem.baixarAudio(m.id, p => aviso(`Baixando o mp3 do site… ${Math.round(p * 100)}%`, 60000));
      try { await Banco.put(m.id, baixado); aviso('mp3 baixado. Fica guardado neste aparelho.'); }
      catch { aviso('Baixei, mas o celular não deixou guardar o mp3 (sem espaço ou navegação privada). Vai baixar de novo na próxima vez.', 8000); }
      const url = URL.createObjectURL(baixado), f = fonteAudio(url), d = f.destruir;
      f.destruir = () => { d(); URL.revokeObjectURL(url); };
      return f;
    } catch { aviso(Nuvem.estado === 'entrar' ? 'O mp3 está no site: entre com a senha (na tela inicial) para ouvir.' : 'Não consegui baixar o mp3 agora. Confira a internet.', 7000); }
  }
  if (m.audioUrl) return fonteAudio(m.audioUrl);
  return null;
}
// o mp3 existe em algum lugar (aparelho, site trancado ou endereço)?
async function temMp3(m) { return !!(m.audioNoSite || m.audioUrl || await Banco.get(m.id).catch(() => null)); }
async function abrirYouTube(m, caixa) {
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
// tipo = fonte tocando ('audio' | 'youtube'): soma o acerto "letra ⇄ música" que o Lucas fez para essa fonte
const deslocamento = (m, tipo) => (tipo && m.ajusteLetra && m.ajusteLetra[tipo]) || 0;
function temposEfetivos(m, n, tipo) {
  const t = (m.tempos || []).slice(0, n), d = deslocamento(m, tipo);
  if (t.filter(x => typeof x === 'number').length >= 2) return { tempos: interpolar(t, n).map(x => x + d), marcados: true };
  if (m.bpm > 0 && n) {
    const passo = (m.compassos || 2) * 4 * 60 / m.bpm, ini = (m.primeiroSom || 0) + d;
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

function desenharEnergia(cv, m, t, marcas, deixas) {
  const dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
  if (!w) return;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
  const g = cv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
  const css = getComputedStyle(document.documentElement), cor = v => css.getPropertyValue(v).trim();
  const dur = m.duracao || 0, e = m.energia;
  // trilha sempre visível (mesmo sem a análise do mp3): o dedo sempre acha onde tocar para pular
  g.fillStyle = cor('--line'); g.fillRect(0, h / 2 - 2, w, 4);
  if (t != null && dur) { g.fillStyle = cor('--c-prato'); g.fillRect(0, h / 2 - 2, Math.min(w, t / dur * w), 4); }
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
  // marcações da bateria: uma fita colorida no pé da faixa, na cor do tipo
  if (deixas && dur) deixas.forEach(k => { g.fillStyle = cor('--c-' + k.tipo) || cor('--muted'); g.fillRect(Math.max(0, k.t / dur * w - 1.5), h - 8, 3, 8); });
  if (t != null && dur) {
    const px = Math.min(w - 2, t / dur * w);
    g.fillStyle = cor('--c-prato'); g.fillRect(px, 0, 3, h);
    g.beginPath(); g.arc(px + 1.5, h / 2, 7, 0, 7); g.fill();
    // hora atual / total, do lado oposto ao ponteiro para não ficar em cima dele
    g.font = '600 13px system-ui, sans-serif'; g.textBaseline = 'top'; g.fillStyle = cor('--text');
    const txt = `${mmss(t)} / ${mmss(dur)}`;
    g.textAlign = px > w / 2 ? 'left' : 'right'; g.fillText(txt, px > w / 2 ? 6 : w - 6, 3);
  }
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
  const { tempos, marcados } = temposEfetivos({ ...m, tempos: m.tempos }, n, 'audio'); // a intensidade é do mp3
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

// Pré-marcação pela música: olha a curva de intensidade do mp3 (meio em meio segundo) e acha onde ela
// sobe, desce ou cai no silêncio. Devolve marcações com o segundo exato, sem depender da letra.
// Quem manda é o ouvido do Lucas: tudo sai com auto:true e dá para conferir/ajustar/apagar depois.
// sens: 0 = menos marcações, 1 = normal, 2 = mais marcações
function premarcarPeloAudio(m, sens = 1) {
  const k = [1.4, 1, 0.7][sens] ?? 1, folga = [12, 8, 5][sens] ?? 8;
  const e = m.energia, dur = m.duracao;
  if (!e || e.length < 20 || !dur) return null;
  const dt = dur / e.length, J = Math.max(2, Math.round(2 / dt)); // janela de ~2 s de cada lado
  const media = (a, b) => { let s = 0, c = 0; for (let i = Math.max(0, a); i < Math.min(e.length, b); i++) { s += e[i]; c++; } return c ? s / c : 0; };
  const cand = [];
  for (let i = J; i <= e.length - J; i++) {
    const t = i * dt; if (t < Math.max(6, (m.primeiroSom || 0) + 3)) continue; // a entrada da banda no começo não é uma "mudança"
    const a = media(i - J, i), b = media(i, i + J), d = b - a;
    let tipo = null, det;
    if (b < 0.12 && a > 0.3) tipo = 'pausa';
    else if (a < 0.1 && b > 0.3) tipo = 'entra';
    else if (d >= 0.14 * k && b >= (1 + 0.35 * k) * Math.max(a, 0.05)) { tipo = b > 0.75 ? 'prato' : 'sobe'; det = b > 0.75 ? 'entra cheio' : 'caixa e tom'; }
    else if (-d >= 0.14 * k && b <= (1 - 0.25 * k) * a) tipo = 'desce';
    if (tipo) cand.push({ t, tipo, det, forca: Math.abs(d) });
  }
  // mudança longa aparece em vários pontos seguidos: fica a mais forte, com pelo menos 8 s entre marcações
  const aceitas = [];
  cand.sort((x, y) => y.forca - x.forca).forEach(c => { if (aceitas.every(o => Math.abs(o.t - c.t) >= folga)) aceitas.push(c); });
  return aceitas.sort((x, y) => x.t - y.t).map(c => ({ t: Math.round(c.t * 10) / 10, tipo: c.tipo, ...(c.det ? { det: c.det } : {}), auto: true }));
}
// escolha "menos / normal / mais marcações" (fica guardada no aparelho)
const htmlSens = () => `<div class="seg sens" role="group" aria-label="Quantas marcações">
  <button type="button" data-s="0">Menos</button><button type="button" data-s="1">Normal</button><button type="button" data-s="2">Mais</button></div>`;
function ligarSens(raiz) {
  const pintar = () => raiz.querySelectorAll('.sens [data-s]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.s === (dados.prefs.sens ?? 1)));
  raiz.querySelectorAll('.sens [data-s]').forEach(b => b.onclick = () => { dados.prefs.sens = +b.dataset.s; gravarLocal(); pintar(); });
  pintar();
}
// junta com o que ele já gravou à mão: troca só as automáticas antigas e não bate em marcação dele
function aplicarPremarcas(m, novas) {
  const dele = (m.marcas || []).filter(x => !x.auto);
  const livres = novas.filter(n => dele.every(x => Math.abs(x.t - n.t) >= 3));
  m.marcas = [...dele, ...livres].sort((a, b) => a.t - b.t);
  m.marcasFonte = 'audio';
  return livres.length;
}

// ---------------- telas ----------------
let P = null; // estado do palco
function pararTudo() {
  if (!P) return;
  P.ativo = false;
  cancelAnimationFrame(P.raf);
  if (P.fonte) P.fonte.destruir();
  if (P.pararClique) P.pararClique();
  app.classList.remove('tocando', 'anotando');
  document.querySelectorAll('.folha, .fim-card, .contagem, .parada-card').forEach(f => f.remove());
  pararMic();
  document.querySelectorAll('.menu-lado, .menu-fundo').forEach(x => { x.hidden = true; });
  try { P.lock && P.lock.release(); } catch {}
  P = null;
}
let edFonte = null; // música tocando dentro do Editar
function rota() {
  pararTudo();
  if (edFonte) { edFonte.destruir(); edFonte = null; }
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
  const mp3 = subindo[m.id] != null ? `mp3 subindo ${Math.round(subindo[m.id] * 100)}%`
    : m.audioNoSite ? 'mp3 no site' : m.audioSubir ? 'mp3 esperando subir' : '';
  if (mp3) p.push(mp3);
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
        <p>Baixa todas as músicas, letras, marcações e ensaios num arquivo (o mp3 não vai junto). "Importar" traz de volta.
          ${dados.prefs.ultimaCopia ? `Última cópia neste aparelho: ${esc(new Date(dados.prefs.ultimaCopia).toLocaleDateString('pt-BR'))}.` : 'Você ainda não fez nenhuma cópia neste aparelho.'}</p>
        <div class="acoes">
          <button class="btn" id="exportar">Baixar cópia de segurança</button>
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
  $('#nova-lista').onclick = () => criarEnsaio();
  $('#exportar').onclick = () => {
    const musicas = todas().map(({ origem, temAudio, ...m }) => m);
    const dia = new Date().toISOString().slice(0, 10);
    baixar(`mapa-bateria-${dia}.json`, JSON.stringify({ musicas, listas: dados.listas }, null, 1), 'application/json');
    dados.prefs.ultimaCopia = Date.now(); gravarLocal(); telaLista();
    aviso('Cópia baixada. Guarde o arquivo em um lugar seguro (Arquivos, Drive).', 7000);
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
let ensaioNovo = null; // ensaio recém-criado: o campo do nome já abre selecionado para digitar
function criarEnsaio(nome, musicas = []) {
  const l = { id: 'l' + Date.now().toString(36), nome: nome || 'Ensaio ' + new Date().toLocaleDateString('pt-BR'), musicas: [...musicas] };
  dados.listas.unshift(l); salvar();
  ensaioNovo = l.id;
  location.hash = '#/l/' + encodeURIComponent(l.id);
}
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
        ${l.musicas.length ? `<section class="bloco"><h2>Levar para o ensaio</h2>
          <p class="dica" id="prep-info">Conferindo os mp3…</p>
          <button class="btn primario" id="preparar" type="button" disabled>Baixar os mp3 deste ensaio</button></section>` : ''}
        <section class="bloco"><h2>Colocar no ensaio</h2>
          ${fora.length ? `<ul class="adicionar">${fora.map(m => `<li><button class="btn" data-por="${esc(m.id)}">${ICONE.mais}${esc(m.titulo || 'Sem nome')}</button></li>`).join('')}</ul>`
          : '<p class="dica">Todas as músicas já estão neste ensaio.</p>'}
        </section>
        <section class="bloco"><h2>Outro ensaio</h2>
          <div class="acoes"><button class="btn primario" id="l-novo" type="button">Criar um ensaio novo (vazio)</button>
          <button class="btn" id="l-copiar" type="button">Copiar este ensaio</button></div>
          <p class="dica">O ensaio novo começa vazio: você dá o nome e toca nas músicas para colocar. "Copiar" leva as mesmas músicas para você mudar o que precisar.</p>
        </section>
        <button class="btn perigo apagar" id="l-apagar" type="button">Apagar este ensaio</button>
      </main>`;
    const nome = $('#l-nome');
    nome.value = l.nome;
    if (ensaioNovo === l.id) { ensaioNovo = null; nome.focus(); nome.select(); }
    $('#l-novo').onclick = () => criarEnsaio();
    $('#l-copiar').onclick = () => criarEnsaio('Cópia de ' + l.nome, l.musicas);
    nome.oninput = () => { l.nome = nome.value.trim() || 'Ensaio'; $('.topo h1').textContent = l.nome; salvar(); };
    app.querySelectorAll('[data-mover]').forEach(b => b.onclick = () => {
      const [i, d] = b.dataset.mover.split(',').map(Number);
      [l.musicas[i], l.musicas[i + d]] = [l.musicas[i + d], l.musicas[i]];
      salvar(); desenhar();
    });
    app.querySelectorAll('[data-tirar]').forEach(b => b.onclick = () => { l.musicas.splice(+b.dataset.tirar, 1); salvar(); desenhar(); });
    app.querySelectorAll('[data-por]').forEach(b => b.onclick = () => { l.musicas.push(b.dataset.por); salvar(); desenhar(); });
    // mp3 de todas as músicas do ensaio no celular antes de sair de casa (com Wi-Fi)
    if (l.musicas.length) {
      const info = $('#prep-info'), botao = $('#preparar'), vivo = () => document.body.contains(info);
      const conferir = async () => {
        let faltam = 0, semMp3 = 0;
        for (const mid of l.musicas) {
          const x = mapa.get(mid);
          if (!x.audioNoSite && !x.audioUrl && !(await Banco.get(mid))) semMp3++;
          else if (x.audioNoSite && !(await Banco.get(mid))) faltam++;
        }
        if (!vivo()) return;
        info.textContent = (faltam ? `${faltam} mp3 ainda não ${faltam === 1 ? 'está' : 'estão'} neste celular. Baixe agora, de preferência no Wi-Fi.` : 'Todos os mp3 deste ensaio já estão neste celular.')
          + (semMp3 ? ` ${semMp3} música${semMp3 === 1 ? '' : 's'} sem mp3.` : '');
        botao.disabled = !faltam;
      };
      conferir();
      botao.onclick = async () => {
        botao.disabled = true;
        if (Nuvem.pronto) await Nuvem.pronto;
        if (Nuvem.estado === 'entrar') { info.textContent = 'Entre com a senha na tela inicial (Guardar no site) para baixar os mp3.'; return; }
        let ok = 0; const falhas = [];
        for (let k = 0; k < l.musicas.length; k++) {
          const x = mapa.get(l.musicas[k]);
          if (!x.audioNoSite || await Banco.get(x.id)) continue;
          try {
            const b = await Nuvem.baixarAudio(x.id, p => { if (vivo()) info.textContent = `Baixando ${k + 1} de ${l.musicas.length}: ${x.titulo || 'Sem nome'} ${Math.round(p * 100)}%`; });
            await Banco.put(x.id, b); ok++;
          } catch { falhas.push(x.titulo || 'Sem nome'); }
        }
        if (!vivo()) { aviso(falhas.length ? `Não baixei: ${falhas.join(', ')}.` : `${ok} mp3 baixado(s).`, 7000); return; }
        await conferir();
        if (falhas.length) info.textContent = `Não consegui baixar: ${falhas.join(', ')}. Confira a internet e tente de novo. ` + info.textContent;
        else if (ok) info.textContent = `${ok} mp3 baixado(s). ` + info.textContent;
      };
    }
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
    if (it.k === 'deixa') return it.marca != null
      ? `<div class="deixa gravada" data-marca="${it.marca}" style="--cor:var(--c-${it.tipo})">${ICONE[it.tipo]}<span>${esc(it.txt)}</span></div>`
      : `<div class="deixa" data-r="${it.r}" style="--cor:var(--c-${it.tipo})">${ICONE[it.tipo]}<span>${esc(it.txt)}</span></div>`;
    if (it.k === 'linha') return `<p class="linha" data-i="${it.i}" data-r="${it.r}">${esc(it.txt)}</p>`;
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
  const { nLinhas } = interpretar(m.texto);
  // cada marcação aponta para a linha de letra que vem logo depois dela
  let deixas = [];
  function lerDeixas() {
    const { itens } = interpretar(m.texto);
    // marcações gravadas ouvindo (com o segundo exato): entram acima da linha cantada naquele momento,
    // se os tempos da letra estiverem marcados
    (m.marcas || []).map((mk, idx) => ({ mk, idx })).sort((a, b) => a.mk.t - b.mk.t).forEach(({ mk, idx }) => {
      if (!marcados || !tempos) return;
      let alvo = tempos.findIndex(x => x >= mk.t - 0.8);
      if (alvo < 0) alvo = nLinhas;
      const item = { k: 'deixa', tipo: mk.tipo, txt: TIPOS[mk.tipo] + (mk.det ? ' ' + mk.det : ''), marca: idx };
      const pos = itens.findIndex(x => x.k === 'linha' && x.i === alvo);
      if (pos < 0) itens.push(item); else itens.splice(pos, 0, item);
    });
    deixas = []; let pend = [];
    itens.forEach(it => {
      if (it.k === 'deixa') pend.push(it);
      if (it.k === 'linha') { pend.forEach(d => deixas.push({ ...d, alvo: it.i })); pend = []; }
    });
    pend.forEach(d => deixas.push({ ...d, alvo: nLinhas }));
    return itens;
  }

  app.innerHTML = `
    <header class="topo"><a class="btn icone" href="${ensaio ? '#/l/' + encodeURIComponent(ensaio.id) : '#/'}" aria-label="Voltar">${ICONE.voltar}</a>
      <h1>${esc(m.titulo || 'Sem nome')}</h1><a class="btn" href="#/e/${encodeURIComponent(m.id)}${ensaio ? '/' + encodeURIComponent(ensaio.id) : ''}">Editar</a></header>
    ${barraEnsaio}
    <canvas class="faixa" id="faixa" aria-label="Intensidade da música; toque para pular"></canvas>
    <main class="rolagem palco" id="palco">
      <div class="fonte-escolha" id="fonte-escolha" hidden>
        <span>Tocar com:</span>
        <div class="seg" role="group" aria-label="Tocar com"><button data-f="mp3">mp3</button><button data-f="youtube">YouTube</button></div>
        <label class="btn" id="fonte-por">${ICONE.som}Pôr o mp3<input type="file" accept="audio/*" hidden></label>
        <span class="fonte-info" id="fonte-info"></span>
      </div>
      <div class="yt" id="yt" hidden></div><div id="letra"></div><div class="fim"></div></main>
    <footer class="controle">
      <div class="proxima" id="proxima" aria-live="polite"></div>
      <div class="rapido" aria-label="Ajustes rápidos">
        <div class="grp"><span>BPM</span><button type="button" id="r-bpm-" aria-label="BPM mais lento">−</button><output id="r-bpm"></output><button type="button" id="r-bpm+" aria-label="BPM mais rápido">+</button></div>
        <div class="grp"><span>Música</span><button type="button" id="r-vol-" aria-label="Volume da música menos">−</button><output id="r-vol"></output><button type="button" id="r-vol+" aria-label="Volume da música mais">+</button></div>
        <div class="grp"><span>Clique</span><button type="button" id="r-cl-" aria-label="Volume do clique menos">−</button><output id="r-cl"></output><button type="button" id="r-cl+" aria-label="Volume do clique mais">+</button></div>
      </div>
      <div class="botoes">
        <button class="btn icone" id="ant" aria-label="Linha anterior">${ICONE.anterior}</button>
        <button class="btn" id="inicio" type="button" aria-label="Começar a música do começo">⏮ Início</button>
        <button class="btn primario grande" id="play"></button>
        <button class="btn icone" id="prox" aria-label="Próxima linha">${ICONE.proxima}</button>
        <button class="btn icone" id="menu-abrir" aria-label="Opções" aria-controls="menu" aria-expanded="false">${ICONE.menu}</button>
      </div>
    </footer>
    <div class="menu-fundo" id="menu-fundo" hidden></div>
    <aside class="menu-lado" id="menu" hidden aria-label="Opções">
      <div class="menu-topo"><b>Opções</b><button class="btn icone" id="menu-fechar" aria-label="Fechar">${ICONE.fechar}</button></div>
      <div class="menu-corpo">
        <section>
          <h3>Letra junto com a música</h3>
          <button class="btn item" id="sincronizar" type="button">${ICONE.proxima}<span>Sincronizar a letra<small>A música toca e você toca no começo de cada linha cantada</small></span></button>
          <div class="acerto">
            <button class="btn icone" id="ac-menos" type="button" aria-label="Letra meio segundo mais cedo">−½</button>
            <button class="btn" id="ac-agora" type="button">Letra começa agora</button>
            <button class="btn icone" id="ac-mais" type="button" aria-label="Letra meio segundo mais tarde">+½</button>
          </div>
          <p class="dica" id="acerto-info"></p>
        </section>
        <section>
          <h3>Bateria</h3>
          <button class="btn item" id="gravar" type="button">${ICONE.gravar}<span>Gravar a bateria ouvindo<small>Toque Sobe, Virada, Caixa… na hora em que muda</small></span></button>
          ${htmlSens()}
          <button class="btn item" id="premarcar" type="button">${ICONE.sobe || ICONE.anterior}<span>Pré-marcar pela música<small>Acho onde a música sobe, desce ou fica em silêncio. Você confere em "Gravar"</small></span></button>
          <p class="dica">Toque numa linha para a música pular até ela. Segure o dedo na linha para pôr uma marcação.</p>
        </section>
        <section>
          <h3>Repetir um trecho</h3>
          <p class="dica">Toque a música e aperte "Começo aqui" e "Fim aqui" nos pontos certos. Ela fica repetindo esse trecho para você treinar.</p>
          <div class="acoes"><button class="btn" id="laco-a" type="button">Começo aqui</button><button class="btn" id="laco-b" type="button">Fim aqui</button></div>
          <div class="acoes"><button class="btn" id="laco-liga" type="button" aria-pressed="false">Repetir</button><button class="btn" id="laco-limpar" type="button">Limpar</button></div>
          <p class="dica" id="laco-info"></p>
        </section>
        <section>
          <h3>Paradas: esperar até você voltar</h3>
          <p class="dica">"Esperar aqui": a música para neste ponto e fica esperando. Quando for cantar, toque Continuar. Para repetir um trecho até você liberar (um refrão que se repete), marque o trecho em "Repetir um trecho" e toque o botão de baixo.</p>
          <div class="acoes"><button class="btn" id="par-esperar" type="button">Esperar aqui</button><button class="btn" id="par-repetir" type="button">Repetir o trecho até eu liberar</button></div>
          <ul class="paradas" id="par-lista"></ul>
        </section>
        <section>
          <h3>Som</h3>
          <button class="btn item" id="contagem" type="button" aria-pressed="false"><span>Contagem antes de tocar<small>Conta os tempos no BPM (1, 2, 3, 4) e só então a música começa</small></span></button>
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
        <label class="btn bater-tempo">${ICONE.som}Pôr o mp3 desta música<input type="file" id="som-mp3" accept="audio/*" hidden></label>
        <p class="dica" id="clique-info"></p>
        </section>
        <section>
          <h3>Como a letra anda</h3>
          <div class="seg" role="group" aria-label="Como a letra anda">
            <button data-modo="audio" title="Toca a música (mp3 ou YouTube) e a letra acompanha">Música</button><button data-modo="tempo" title="Cronômetro: anda pelos tempos marcados, sem tocar som">Tempo</button><button data-modo="manual">Manual</button>
          </div>
          <button class="btn item" id="ouvir" type="button" title="Liga o microfone e começa o cronômetro quando a banda tocar">${ICONE.mic}<span>Ouvir a banda<small>O cronômetro começa sozinho quando a banda tocar</small></span><span class="medidor" hidden><i></i></span></button>
        </section>
        <section>
          <h3>Tamanho da letra</h3>
          <div class="acoes"><button class="btn" id="menor" aria-label="Letra menor">A−</button><button class="btn" id="maior" aria-label="Letra maior">A+</button></div>
        </section>
      </div>
    </aside>`;

  const palco = $('#palco'), faixa = $('#faixa'), proxima = $('#proxima');
  let linhasEl = [];
  // desenha só a letra; o vídeo do YouTube em cima fica intacto (a música não para)
  function montarLetra() {
    const itens = lerDeixas();
    const rol = palco.scrollTop; // a letra é redesenhada, mas a tela não pode pular
    requestAnimationFrame(() => { palco.scrollTop = rol; });
    $('#letra').innerHTML = nLinhas ? renderItens(itens)
      : `<div class="sem-letra"><p class="vazio">Esta música ainda não tem letra. Abra no Cifra Club, copie a cifra e volte aqui.</p>
          <div class="acoes"><a class="btn" href="${esc(urlCifra(m.titulo, m.artista, m.cifra))}" target="_blank" rel="noopener">Abrir no Cifra Club</a>
          <a class="btn" href="${esc(buscaVersoes(m.titulo, m.artista))}" target="_blank" rel="noopener">Procurar versões</a>
          <button class="btn primario" id="palco-colar" type="button">Colar letra</button></div></div>`;
    palco.scrollTop = rol;
    const colar = $('#palco-colar');
    if (colar) colar.onclick = async () => {
      const letra = await lerLetraCopiada();
      if (!letra) return;
      const { texto, inseridas } = letraComMarcacoes(letra);
      m.texto = texto; guardarAjuste();
      aviso(inseridas ? `Letra colada, com ${inseridas} marcação(ões) da bateria. Use Anotar para ajustar.` : 'Letra colada.', 7000);
      rota(); // reabre com a letra (o número de linhas mudou)
    };
    // cada marcação sabe de qual linha de letra ela é (a de baixo); ela não conta como linha da música
    let pendentes = [];
    $('#letra').querySelectorAll('.deixa, .linha').forEach(el => {
      if (el.classList.contains('deixa')) pendentes.push(el);
      else { pendentes.forEach(d => { d.dataset.alvo = el.dataset.i; }); pendentes = []; }
    });
    pendentes.forEach(d => { d.dataset.alvo = String(nLinhas); });
    linhasEl = [...palco.querySelectorAll('.linha')];
    acenderDeixas(P ? P.atual : -1);
    linhasEl.forEach((el, k) => {
      el.classList.toggle('atual', P && k === P.atual); el.classList.toggle('passada', P && k < P.atual);
      // tocou na linha: escolhe a bateria para pôr em cima dela (a música continua)
      // toque: a música pula para esta linha (e segue tocando, ou fica pronta para o Tocar).
      // segurar o dedo: abre a escolha da bateria para pôr em cima da linha
      let seguro = null, abriu = false;
      const abrirBateria = () => { abriu = true; if (navigator.vibrate) try { navigator.vibrate(30); } catch {} abrirFolha({ antesDe: +el.dataset.r, linha: +el.dataset.i, rotulo: el.textContent }); };
      let x0 = 0, y0 = 0;
      // com a música tocando, a letra nunca abre o menu da bateria: o toque só pula a música
      const tocandoAgora = () => P.tocando && P.modo !== 'manual';
      el.onpointerdown = ev => { abriu = false; x0 = ev.clientX; y0 = ev.clientY; clearTimeout(seguro); if (!tocandoAgora()) seguro = setTimeout(abrirBateria, 550); };
      el.onpointermove = ev => { if (Math.hypot(ev.clientX - x0, ev.clientY - y0) > 10) clearTimeout(seguro); }; // rolando a letra, não segurando
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => { el['on' + ev] = () => clearTimeout(seguro); });
      el.oncontextmenu = ev => ev.preventDefault();
      el.onclick = () => {
        if (abriu) return;
        if (tempos || P.modo === 'manual') irPara(+el.dataset.i, true);
        else if (tocandoAgora()) aviso('Para pular pela letra, sincronize a letra (☰ → Sincronizar). Use −5 s e +5 s para andar na música.', 6000);
        else abrirBateria(); // sem tempos a música não sabe onde a linha está: só dá para pôr a bateria
      };
    });
    palco.querySelectorAll('.deixa').forEach(el => {
      el.onclick = () => {
        if (P.tocando && P.modo !== 'manual') return; // tocando: não abre o menu
        if (el.dataset.marca != null) abrirFolha({ marca: +el.dataset.marca, rotulo: el.textContent });
        else abrirFolha({ trocar: +el.dataset.r, rotulo: el.textContent });
      };
    });
    if (P) mostrarProxima();
  }
  // a marcação da linha cantada agora acende; as das linhas que já passaram apagam
  function acenderDeixas(i) {
    palco.querySelectorAll('#letra .deixa').forEach(d => {
      const a = +d.dataset.alvo;
      d.classList.toggle('agora', a === i);
      d.classList.toggle('passada', i >= 0 && a < i);
    });
  }
  const PALAVRA = { sobe: 'sobe', desce: 'desce', virada: 'virada', prato: 'prato', caixa: 'caixa', bumbo: 'bumbo', chimbal: 'chimbal',
    corte: 'corte', conducao: 'condução', pausa: 'para', entra: 'entra' };
  // folha de baixo: escolhe a marcação para pôr acima da linha tocada (ou trocar/apagar a que foi tocada)
  function abrirFolha({ antesDe, trocar, marca, linha, rotulo }) {
    fecharFolha();
    $('#aviso').hidden = true; // o aviso flutuante cobriria os botões
    const linhas = String(m.texto || '').split(/\r?\n/);
    let detalhe = '';
    if (marca != null) { detalhe = m.marcas[marca].det || ''; trocar = -1; } // gravada ouvindo: troca no m.marcas
    else if (trocar != null) {
      const resto = linhas[trocar].trim().replace(/^!\s*/, '').replace(/^bateria\s*/i, '');
      const [p, ...r] = resto.split(/\s+/);
      detalhe = ALIAS[semAcento(p || '')] ? r.join(' ') : resto;
    }
    const el = document.createElement('div');
    el.className = 'folha'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Marcação');
    el.innerHTML = `
      <p class="f-onde">${trocar != null ? 'Trocar' : 'Pôr acima de'}: <b>${esc(rotulo)}</b></p>
      <div class="f-tipos">${Object.keys(PALAVRA).map(t => `<button class="btn" data-t="${t}" style="--cor:var(--c-${t})">${ICONE[t]}${TIPOS[t]}</button>`).join('')}</div>
      <label class="campo">Detalhe ou recado (opcional)<input id="f-det" autocomplete="off" placeholder="ex.: só aro, segura o prato"></label>
      <div class="acoes">
        <button class="btn" data-t="livre" style="--cor:var(--c-livre)">${ICONE.livre}Pôr como nota</button>
        ${trocar != null ? '<button class="btn perigo" id="f-apagar">Apagar</button>' : ''}
        ${linha != null && tempos ? `<button class="btn" id="f-daqui">${ICONE.play}Tocar daqui</button>` : ''}
        ${linha != null && tempos ? '<button class="btn" id="f-parar">Esperar antes desta linha</button>' : ''}
        <button class="btn" id="f-fechar">Fechar</button>
      </div>`;
    document.body.appendChild(el);
    const det = $('#f-det', el); det.value = detalhe;
    const aplicar = (nova, tipo, det) => {
      if (marca != null) {
        if (nova == null) m.marcas.splice(marca, 1);
        else if (tipo === 'livre') { aviso('Recado livre vai na letra: use Anotar numa linha.'); return; }
        else Object.assign(m.marcas[marca], { tipo, det: det || undefined });
        guardarAjuste(); montarLetra(); fecharFolha();
        return;
      }
      if (trocar != null) { if (nova == null) linhas.splice(trocar, 1); else linhas[trocar] = nova; }
      else linhas.splice(antesDe, 0, nova);
      m.texto = linhas.join('\n');
      guardarAjuste(); montarLetra(); fecharFolha();
    };
    el.querySelectorAll('[data-t]').forEach(b => b.onclick = () => {
      const t = b.dataset.t, d = det.value.trim();
      if (t === 'livre' && !d) { det.focus(); aviso('Escreva o recado no campo.'); return; }
      aplicar(`! ${t === 'livre' ? 'nota' : PALAVRA[t]}${d ? ' ' + d : ''}`, t, d);
    });
    if (trocar != null) $('#f-apagar', el).onclick = () => aplicar(null);
    const daqui = $('#f-daqui', el);
    if (daqui) daqui.onclick = () => { fecharFolha(); irPara(linha, true); if (!P.tocando) comecar(); };
    const parar = $('#f-parar', el);
    if (parar) parar.onclick = () => { const t = Math.max(0, tempos[linha] - 0.2); fecharFolha(); porParada(t); aviso(`Parada em ${mmss(t)}: a música espera antes desta linha.`); };
    $('#f-fechar', el).onclick = fecharFolha;
  }
  function fecharFolha() { document.querySelectorAll('.folha').forEach(f => f.remove()); }
  // a música acabou: com ensaio, um toque abre a próxima
  function fimDaMusica() {
    document.querySelectorAll('.fim-card').forEach(x => x.remove());
    if (!depois) { aviso(ensaio ? 'Acabou. Era a última música do ensaio.' : 'Acabou a música.', 8000); return; }
    const el = document.createElement('div'); el.className = 'fim-card';
    el.innerHTML = `<span>Acabou. Próxima do ensaio:</span><b>${esc(depois.titulo)}</b>
      <div class="acoes"><a class="btn primario" href="${depois.href}">Abrir a próxima</a><button class="btn" type="button">Ficar aqui</button></div>`;
    document.body.appendChild(el);
    el.querySelector('button').onclick = () => el.remove();
  }
  $('#gravar').onclick = () => {
    pausar(); fecharFolha(); if (P.fecharMenu) P.fecharMenu();
    const { origem, ...copia } = m;
    const alvo = JSON.parse(JSON.stringify(copia));
    gravarMarcacoes(alvo, (marcas, fonteTipo, novosTempos) => {
      if (!marcas) { if (P === meuClique) rota(); return; }
      m.marcas = marcas; m.marcasFonte = fonteTipo;
      if (novosTempos) { m.tempos = novosTempos; m.temposFonte = fonteTipo; m.ajusteLetra = { ...(m.ajusteLetra || {}), [fonteTipo]: 0 }; }
      guardarAjuste();
      const naLetra = marcados || novosTempos;
      aviso(`${marcas.length} marcação(ões) gravada(s)` + (naLetra ? ', já em cima da letra.' : (nLinhas ? '. Para irem para a letra, grave de novo tocando "Próxima linha" quando o cantor mudar de linha.' : '.')), 9000);
      if (P === meuClique) rota();
    });
  };
  ligarSens(app);
  $('#premarcar').onclick = () => {
    const novas = premarcarPeloAudio(m, dados.prefs.sens ?? 1);
    if (!novas) { aviso('Preciso do mp3 desta música neste celular (Som, Pôr o mp3) para ouvir onde ela sobe e desce.', 8000); return; }
    const n = aplicarPremarcas(m, novas);
    if (!n) { aviso('Não achei mudanças claras na música. Use "Gravar a bateria ouvindo" para marcar na mão.', 8000); return; }
    guardarAjuste();
    aviso(`${n} marcação(ões) pré-marcada(s) pela música (veja as fitas coloridas na faixa de cima). É só um palpite: abra "Gravar a bateria ouvindo" para ouvir, ajustar ou apagar.`, 12000);
    if (P === meuClique) rota();
  };
  let { tempos, marcados } = temposEfetivos(m, nLinhas);
  P = { ativo: true, m, tempos, fonte: null, modo: 'manual', tocando: false, base: 0, t0: 0, atual: -1, raf: 0 };
  // a música carregou ou o acerto mudou: os tempos da letra passam a valer para essa fonte
  function recalcularTempos() {
    ({ tempos, marcados } = temposEfetivos(m, nLinhas, P.fonte ? P.fonte.tipo : null));
    P.tempos = tempos;
    montarLetra(); desenhar(); mostrarAcerto();
  }
  // onde a letra começa (em segundos da música que está tocando)
  const inicioLetra = () => tempos && tempos.length ? tempos[0] : null;
  function acertarLetra(novoInicio) {
    if (!P.fonte || !tempos) return;
    const tipo = P.fonte.tipo, base = inicioLetra() - deslocamento(m, tipo);
    m.ajusteLetra = { ...(m.ajusteLetra || {}), [tipo]: Math.round((novoInicio - base) * 100) / 100 };
    guardarAjuste(); recalcularTempos();
  }
  function mostrarAcerto() {
    const el = $('#acerto-info'); if (!el) return;
    const i = inicioLetra();
    el.textContent = !P.fonte ? 'Ponha a música para acertar a letra com ela.'
      : !tempos ? 'Marque os tempos ou informe o BPM para a letra andar.'
      : `A letra começa em ${mmss(i)},${Math.floor((i % 1) * 10)}. Arraste a marca verde na faixa de cima, ou use os botões.`;
  }
  const pode = { audio: false, tempo: !!tempos, manual: true };

  const tempoAtual = () => P.modo === 'audio' && P.fonte ? P.fonte.t
    : P.tocando ? P.base + (agora() - P.t0) / 1000 : P.base;
  function ehYT() { return !!(P && P.fonte && P.fonte.tipo === 'youtube'); }
  // a análise (intensidade, duração) veio do mp3; com o vídeo do YouTube ela não bate, então não aparece
  const duracao = () => (ehYT() ? P.fonte.duracao : m.duracao) || (P.fonte && P.fonte.duracao) || (tempos ? tempos[nLinhas - 1] + 8 : 0);

  let arrastoT = null; // onde a marca verde está sendo arrastada
  const lacoAB = { a: null, b: null, on: false, espera: 0 }; // trecho repetido para treinar
  // paradas (m.paradas = [{t, volta?}]): a música para em t e espera; com "volta" repete de volta até t até liberar
  const par = { ultT: null, preso: null, libera: null, esperando: null };
  function desenhar() {
    desenharEnergia(faixa, { ...m, energia: ehYT() ? null : m.energia, duracao: duracao() }, P.modo === 'manual' ? null : tempoAtual(), tempos, m.marcas);
    if (m.paradas && m.paradas.length && duracao()) {
      const g = faixa.getContext('2d'), w = faixa.clientWidth, h = faixa.clientHeight, dur = duracao();
      g.save(); g.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--c-prato').trim() || '#e6a';
      m.paradas.forEach(p => {
        const x = p.t / dur * w;
        if (p.volta != null) { g.globalAlpha = 0.25; g.fillRect(p.volta / dur * w, 0, Math.max(2, x - p.volta / dur * w), h); g.globalAlpha = 1; }
        g.fillRect(x - 1.5, 0, 3, h);
        g.fillRect(x - 6, h - 5, 12, 5);
      });
      g.restore();
    }
    if (lacoAB.a != null && duracao()) {
      const g = faixa.getContext('2d'), w = faixa.clientWidth, h = faixa.clientHeight, dur = duracao();
      const x1 = lacoAB.a / dur * w, x2 = (lacoAB.b ?? lacoAB.a) / dur * w;
      g.save(); g.globalAlpha = lacoAB.on ? 0.35 : 0.2;
      g.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--c-virada').trim() || '#888';
      g.fillRect(x1, 0, Math.max(3, x2 - x1), h); g.restore();
    }
    // marca verde: onde a letra começa nesta música (arrastável)
    const ini = arrastoT != null ? arrastoT : inicioLetra(), dur = duracao();
    if (!P.fonte || ini == null || !dur) return;
    const g = faixa.getContext('2d'), w = faixa.clientWidth, h = faixa.clientHeight;
    const x = Math.max(1, Math.min(w - 2, ini / dur * w));
    g.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--c-sobe').trim();
    g.fillRect(x - 1.5, 0, 3, h);
    g.beginPath(); g.moveTo(x - 7, 0); g.lineTo(x + 7, 0); g.lineTo(x, 9); g.fill();
  }
  // dentro de um solo/instrumental marcado: mostra quanto falta para voltar a cantar
  function soloAgora() {
    if (!m.solos || !m.solos.length || !tempos || !P.tocando || P.modo === 'manual') return null;
    const d = deslocamento(m, P.fonte ? P.fonte.tipo : null), tt = tempoAtual();
    const s = m.solos.find(x => tempos[x.k] != null && tt >= x.t + d && tt < tempos[x.k]);
    return s ? { falta: tempos[s.k] - tt } : null;
  }
  function mostrarProxima() {
    const so = soloAgora();
    if (so) {
      proxima.className = 'proxima' + (so.falta <= 2 ? ' ja' : '');
      proxima.innerHTML = `<span class="mini" style="--cor:var(--c-livre)">Solo / instrumental</span><span>${so.falta < 0.5 ? 'volta a cantar agora' : `volta a cantar em ${Math.ceil(so.falta)} s`}</span>`;
      return;
    }
    // marcação gravada com o segundo exato chegando: ela manda na barra (contagem regressiva)
    if (P.tocando && P.modo !== 'manual' && m.marcas && m.marcas.length) {
      const agoraS = tempoAtual(), mk = m.marcas.filter(x => x.t > agoraS - 0.3).sort((x, y) => x.t - y.t)[0];
      if (mk && mk.t - agoraS <= 10) {
        const falta = Math.max(0, mk.t - agoraS);
        proxima.className = 'proxima' + (falta <= 2 ? ' ja' : '');
        proxima.innerHTML = `<span>Próxima:</span><span class="mini" style="--cor:var(--c-${mk.tipo})">${ICONE[mk.tipo]}${esc(TIPOS[mk.tipo] + (mk.det ? ' ' + mk.det : ''))}</span><span>${falta < 0.5 ? 'agora' : `em ${Math.ceil(falta)} s`}</span>`;
        return;
      }
    }
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
      pularPara(tempos[i]);
    }
    if (i === P.atual) return;
    P.atual = i;
    linhasEl.forEach((el, k) => { el.classList.toggle('atual', k === i); el.classList.toggle('passada', k < i); });
    acenderDeixas(i);
    // a rolagem para com a marcação da linha à vista (ela fica em cima), não só a letra
    const el = palco.querySelector(`#letra .deixa[data-alvo="${Math.max(0, i)}"]`) || linhasEl[Math.max(0, i)];
    if (el) palco.scrollTo({ top: Math.max(0, el.offsetTop - palco.offsetTop - palco.clientHeight * 0.3), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    mostrarProxima();
  }
  function laco() {
    if (!P || !P.ativo) return;
    // a música pode ser pausada pelo próprio player do YouTube: o botão segue o estado real
    if (P.modo === 'audio' && P.fonte && P.fonte.tocando !== P.tocando) {
      P.tocando = P.fonte.tocando; rotularPlay(); if (P.tocando) manterTela();
    }
    // repetir trecho: chegou no fim, volta ao começo (a espera evita voltar duas vezes antes do pulo valer)
    if (lacoAB.on && P.tocando && P.modo !== 'manual' && agora() > lacoAB.espera && tempoAtual() >= lacoAB.b) {
      lacoAB.espera = agora() + 600; pularPara(lacoAB.a); P.alvoT = null;
    }
    // paradas: passou naturalmente por uma (não foi pulo): para e espera, ou volta e repete até liberar
    if (P.tocando && P.modo !== 'manual') {
      const tNow = tempoAtual(), antes = par.ultT; par.ultT = tNow;
      if (antes != null && tNow - antes < 3 && m.paradas) {
        const x = m.paradas.find(p => antes < p.t && p.t <= tNow && par.libera !== p.t);
        if (x) dispararParada(x);
      }
      if (par.libera != null && tNow > par.libera + 1) par.libera = null;
    } else par.ultT = null;
    if (P.tocando && tempos && P.modo !== 'manual') {
      const t = tempoAtual() + 0.35; // um pouco adiantado: a marcação aparece antes de acontecer
      let i = -1; while (i + 1 < nLinhas && tempos[i + 1] <= t) i++;
      irPara(i, false);
      mostrarProxima();
    } else if (P.tocando && m.marcas && m.marcas.length) mostrarProxima(); // contagem das gravadas, mesmo sem letra
    desenhar();
    P.raf = requestAnimationFrame(laco);
  }
  function rotularPlay() {
    // tocando: a tela vira modo palco (só letra, próxima marcação e o botão de pausa)
    app.classList.toggle('tocando', P.tocando && P.modo !== 'manual');
    if (P.cliqueDoZero) P.cliqueDoZero();
    const b = $('#play');
    // as setas ao lado do Tocar: linha anterior/próxima no Manual; −5 s/+5 s com a música
    const ant = $('#ant'), prx = $('#prox'), man = P.modo === 'manual';
    if (ant) {
      ant.innerHTML = man ? ICONE.anterior : '<span>−5 s</span>'; prx.innerHTML = man ? ICONE.proxima : '<span>+5 s</span>';
      ant.setAttribute('aria-label', man ? 'Linha anterior' : 'Voltar 5 segundos'); prx.setAttribute('aria-label', man ? 'Próxima linha' : 'Avançar 5 segundos');
    }
    if (P.modo === 'manual') b.innerHTML = `${ICONE.proxima}<span>Próxima linha</span>`;
    else b.innerHTML = P.tocando ? `${ICONE.pause}<span>Pausar</span>` : `${ICONE.play}<span>Tocar</span>`;
  }
  let avisouSemSom = false;
  // pula a música (ou o cronômetro) para t segundos e lembra: o Tocar seguinte começa daí, não do começo
  function pularPara(t) {
    par.ultT = null;
    P.alvoT = t;
    if (P.modo === 'audio' && P.fonte) { try { P.fonte.t = t; } catch {} }
    else { P.base = t; P.t0 = agora(); }
    if (P.cliqueDoZero) P.cliqueDoZero();
  }
  async function tocar() {
    if (P.modo === 'manual') return irPara(P.atual + 1, true);
    if (P.modo === 'audio' && P.fonte && P.alvoT != null && Math.abs(P.fonte.t - P.alvoT) > 0.4) { try { P.fonte.t = P.alvoT; } catch {} }
    if (!P.fonte && !avisouSemSom) {
      // sem música neste aparelho, o Tocar só anda o cronômetro: dizer por que não sai som
      avisouSemSom = true;
      aviso(m.audioNoSite && Nuvem.estado === 'entrar'
        ? 'Sem som: o mp3 está no site, mas este celular não entrou com a senha. Volte à tela inicial, Guardar no site, e entre.'
        : m.audioNoSite && Nuvem.estado !== 'ok'
          ? 'Sem som: o mp3 está no site, mas não consegui baixar agora. Confira a internet e abra a música de novo.'
          : 'Sem som: esta música não tem mp3 neste celular. A letra anda pelo cronômetro. Para ouvir: Som, Pôr o mp3, ou toque YouTube lá em cima.', 12000);
    }
    if (P.modo === 'audio') {
      try { await P.fonte.play(); }
      catch { aviso('O navegador não deixou tocar. Toque de novo.'); return; }
      // iPhone: o pulo feito antes de o mp3 estar pronto é ignorado; refaz com a música já tocando
      if (P.alvoT != null && Math.abs(P.fonte.t - P.alvoT) > 1) { try { P.fonte.t = P.alvoT; } catch {} }
      P.alvoT = null;
      if (P.fonte.tipo === 'youtube') setTimeout(() => { if (P && P.fonte && !P.fonte.tocando && P.modo === 'audio') aviso('Se o vídeo não começou, toque nele uma vez. Depois o botão funciona.', 6000); }, 1500);
    }
    else P.t0 = agora();
    P.tocando = true; rotularPlay(); manterTela();
    if (par.esperando) { par.esperando = null; document.querySelectorAll('.parada-card').forEach(e => e.remove()); }
  }
  function dispararParada(x) {
    const repete = x.volta != null && x.volta < x.t;
    if (repete) { par.preso = x; pularPara(x.volta); P.alvoT = null; }
    else { pausar(); pularPara(x.t + 0.05); par.esperando = x; }
    cartaoParada(x, repete);
  }
  function cartaoParada(x, repete) {
    document.querySelectorAll('.parada-card').forEach(e => e.remove());
    const el = document.createElement('div'); el.className = 'fim-card parada-card';
    el.innerHTML = repete
      ? `<b>Repetindo ${mmss(x.volta)} → ${mmss(x.t)}</b><span>Toque Seguir quando for cantar.</span><div class="acoes"><button class="btn primario" type="button">Seguir</button></div>`
      : `<b>Parada: aguardando</b><span>Toque Continuar quando for cantar.</span><div class="acoes"><button class="btn primario" type="button">Continuar</button></div>`;
    document.body.appendChild(el);
    el.querySelector('button').onclick = () => {
      el.remove();
      if (repete) { par.preso = null; par.libera = x.t; }
      else { par.esperando = null; if (!P.tocando) comecar(); }
    };
  }
  function mostrarParadas() {
    const ul = $('#par-lista'), ps = (m.paradas || []).slice().sort((a, b) => a.t - b.t);
    ul.innerHTML = ps.length ? ps.map(p => `<li><button class="btn" data-ir="${p.t}">${p.volta != null ? `Repete ${mmss(p.volta)} → ${mmss(p.t)}` : `Espera em ${mmss(p.t)}`}</button>
      <button class="btn icone perigo" data-del="${p.t}" aria-label="Apagar parada">${ICONE.fechar}</button></li>`).join('') : '<li class="dica">Nenhuma parada ainda.</li>';
    ul.querySelectorAll('[data-ir]').forEach(b => b.onclick = () => { pularPara(Math.max(0, +b.dataset.ir - 4)); desenhar(); });
    ul.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
      m.paradas = (m.paradas || []).filter(p => p.t !== +b.dataset.del); if (!m.paradas.length) delete m.paradas;
      par.preso = null; par.esperando = null; document.querySelectorAll('.parada-card').forEach(e => e.remove());
      guardarAjuste(); mostrarParadas(); desenhar();
    });
  }
  function porParada(t, volta) {
    t = Math.round(t * 10) / 10;
    m.paradas = (m.paradas || []).filter(p => Math.abs(p.t - t) > 0.3);
    m.paradas.push(volta != null ? { t, volta: Math.round(volta * 10) / 10 } : { t });
    m.paradas.sort((a, b) => a.t - b.t);
    guardarAjuste(); mostrarParadas(); desenhar();
  }
  function pausar() {
    if (!P) return;
    if (contando) contando.cancelar();
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
    app.querySelectorAll('.seg [data-modo]').forEach(b => b.setAttribute('aria-pressed', b.dataset.modo === modo));
    rotularPlay(); desenhar();
  }
  P.comecarPeloSom = () => {
    // a banda começou: o cronômetro parte do primeiro som da gravação
    if (P.modo !== 'tempo') trocarModo('tempo');
    P.base = m.primeiroSom || (marcados ? 0 : (tempos ? tempos[0] : 0)); P.t0 = agora();
    P.tocando = true; rotularPlay(); manterTela(); aviso('Ouvi a banda. Rolando.');
  };

  function atualizarModos() {
    app.querySelectorAll('.seg [data-modo]').forEach(b => {
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
  // o vídeo do YouTube começa em outro ponto que o mp3: cada fonte guarda o seu "1" do clique
  const chaveFase = () => ehYT() ? 'faseYT' : 'faseClique';
  const faseAtual = () => ehYT() ? (m.faseYT ?? 0) : (m.faseClique ?? (m.primeiroSom || 0));
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
  // contagem antes de tocar: 1, 2, 3, 4 no BPM da música (com o clique), e só então a música começa
  let contando = null;
  function contar() {
    return new Promise(ok => {
      ctxClique();
      const n = batidas(), p = periodo();
      const el = document.createElement('div'); el.className = 'contagem'; el.setAttribute('aria-live', 'assertive');
      document.body.appendChild(el);
      let i = 0, timer = 0;
      const fim = feito => { clearTimeout(timer); el.remove(); contando = null; ok(feito); };
      contando = { cancelar: () => fim(false) };
      const passo = () => {
        if (i >= n) { fim(true); return; }
        el.textContent = String(i + 1); bip(ctxAudio.currentTime + 0.02, i === 0);
        i++; timer = setTimeout(passo, p * 1000);
      };
      passo();
    });
  }
  async function comecar() {
    if (contando) { contando.cancelar(); return; }
    if (P.tocando) return;
    if (dados.prefs.contagem && m.bpm && P.modo !== 'manual') {
      $('#play').innerHTML = `${ICONE.pause}<span>Contando…</span>`;
      const feito = await contar();
      if (P !== meuClique) return;
      rotularPlay();
      if (!feito) return;
    }
    await tocar();
  }
  function agendarClique() {
    if (!clique.ligado || !P || P !== meuClique || !m.bpm) return;
    const t = relogioClique(), p = periodo(), fase = faseAtual(), agoraCtx = ctxAudio.currentTime;
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
  P.pararClique = () => { clique.ligado = false; clearTimeout(clique.timer); if (contando) contando.cancelar(); };
  P.cliqueDoZero = cliqueDoZero;
  function mostrarClique() {
    const b = $('#clique');
    b.disabled = !m.bpm;
    b.setAttribute('aria-pressed', clique.ligado);
    b.classList.toggle('ativo', clique.ligado);
    $('#bpm-num').textContent = m.bpm ? `${m.bpm} BPM` : 'sem BPM';
    $('#vol-clique-num').textContent = dados.prefs.clique;
    if (P && P.atualizarRapido) P.atualizarRapido();
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
    m[chaveFase()] = Math.round((((t % compasso) + compasso) % compasso) * 1000) / 1000;
    cliqueDoZero(); guardarAjuste();
    aviso('O 1 do clique agora cai aqui.');
  };
  // escolha da fonte ao entrar: mp3 (padrão) ou YouTube (só se ele tocar no botão); fica guardada na música
  (async () => {
    const tem = await temMp3(m), temYT = !!idYouTube(m.youtube);
    if (P !== meuClique) return;
    const caixa = $('#fonte-escolha');
    const atual = m.fonte === 'youtube' && temYT ? 'youtube' : tem ? 'mp3' : '';
    caixa.querySelectorAll('[data-f]').forEach(b => {
      b.disabled = b.dataset.f === 'mp3' ? !tem : !temYT;
      b.setAttribute('aria-pressed', b.dataset.f === atual);
      b.onclick = () => { if (b.dataset.f === atual) return; m.fonte = b.dataset.f === 'youtube' ? 'youtube' : undefined; guardarAjuste(); rota(); };
    });
    $('#fonte-por').hidden = tem;
    caixa.hidden = false;
    if (!tem && !temYT) caixa.querySelector('.seg').hidden = true;
    // em que pé está o mp3 desta música (atualiza enquanto sobe)
    const info = $('#fonte-info'), noAparelho = !!(await Banco.get(m.id));
    const mostrar = () => { if (P !== meuClique) return; info.textContent = estadoMp3(m, noAparelho); if (subindo[m.id] != null) setTimeout(mostrar, 1000); };
    mostrar();
    if (!atual) aviso(temYT ? 'Escolha como tocar: ponha o mp3 ou toque em YouTube.' : 'Ponha o mp3 para a música tocar.', 6000);
  })();
  $('#fonte-por input').onchange = ev => $('#som-mp3').onchange(ev);
  $('#som-mp3').onchange = async ev => {
    const arq = ev.target.files[0]; if (!arq) return;
    const { origem, ...copia } = m;
    const alvo = JSON.parse(JSON.stringify(copia));
    delete alvo.fonte; // pôs mp3: passa a tocar o mp3
    pausar();
    try { await receberMp3(alvo, arq, t => aviso(t, 8000)); } catch { aviso('Não consegui guardar esse arquivo. Tente um mp3.'); return; }
    if (P === meuClique) rota(); // reabre a música já com o mp3 (a subida para o site continua)
  };
  // menu do lado direito: as opções uma embaixo da outra; a música continua tocando com ele aberto
  const menuAbrir = abrir => {
    $('#menu').hidden = !abrir; $('#menu-fundo').hidden = !abrir;
    $('#menu-abrir').setAttribute('aria-expanded', abrir);
    if (abrir) fecharFolha();
  };
  $('#menu-abrir').onclick = () => menuAbrir($('#menu').hidden);
  $('#menu-fechar').onclick = () => menuAbrir(false);
  $('#menu-fundo').onclick = () => menuAbrir(false);
  P.fecharMenu = () => menuAbrir(false);
  // sincronizar: a música toca e ele toca no começo de cada linha cantada (os tempos da letra)
  $('#sincronizar').onclick = () => {
    const lin = linhasDe(m.texto);
    if (!lin.length) { aviso('Cole a letra antes (Editar → Colar letra).'); return; }
    menuAbrir(false); pausar();
    const { origem, ...copia } = m;
    marcarTempos(lin, JSON.parse(JSON.stringify(copia)), (novos, fonteTipo, marcasNovas, solosNovos) => {
      if (!novos) return;
      if (novos.length) {
        m.tempos = lin.map((_, i) => novos[i] ?? null);
        m.temposFonte = fonteTipo;
        m.ajusteLetra = { ...(m.ajusteLetra || {}), [fonteTipo]: 0 };
        if (solosNovos) { m.solos = solosNovos; solosNovos.forEach(sl => { m.texto = inserirSecaoAntes(m.texto, sl.k, 'Solo'); }); }
        else delete m.solos;
      }
      if (marcasNovas) { m.marcas = marcasNovas; m.marcasFonte = fonteTipo; }
      guardarAjuste();
      aviso([novos.length ? `Letra sincronizada: ${novos.length} linha(s).` : '', marcasNovas ? `${marcasNovas.length} marcação(ões) da bateria guardadas.` : ''].filter(Boolean).join(' ') + ' Agora anda junto com a música.', 8000);
      if (P === meuClique) rota();
    });
  };
  mostrarClique();

  // a música carrega depois da letra aparecer (o YouTube demora um pouco)
  const meu = P;
  abrirFonte(m, $('#yt')).then(fonte => {
    if (P !== meu || !P.ativo) { if (fonte) fonte.destruir(); return; }
    if (!fonte) return;
    P.fonte = fonte; pode.audio = true;
    recalcularTempos(); // aplica o acerto "letra ⇄ música" desta fonte
    fonte.aoTerminar(() => { pausar(); fimDaMusica(); });
    fonte.aoErro(() => { if (P && P.modo === 'audio') aviso('Não consegui abrir o áudio desta música.'); });
    const vol = $('#vol'), num = $('#vol-num');
    const aplicar = () => { fonte.volume(dados.prefs.volume / 100); num.textContent = dados.prefs.volume; };
    vol.value = dados.prefs.volume; aplicar();
    vol.oninput = () => { dados.prefs.volume = +vol.value; aplicar(); };
    vol.onchange = gravarLocal;
    $('#vol-caixa').hidden = false;
    atualizarModos();
    trocarModo('audio');
    const fonteDosTempos = m.temposFonte === 'youtube' ? 'no YouTube' : m.temposFonte === 'audio' ? 'com o mp3' : '';
    if (m.marcas && m.marcas.length && m.marcasFonte && m.marcasFonte !== fonte.tipo)
      aviso(`As marcações gravadas foram feitas ${m.marcasFonte === 'youtube' ? 'no YouTube' : 'com o mp3'} e agora toca ${fonte.tipo === 'youtube' ? 'pelo YouTube' : 'o mp3'}: podem cair fora do tempo. Grave de novo aqui.`, 9000);
    else if (!tempos) aviso('A música toca, mas a letra não sabe quando andar. Use as setas, ou em Editar marque os tempos.', 7000);
    else if (marcados && fonteDosTempos && m.temposFonte !== fonte.tipo)
      aviso(`Os tempos desta música foram marcados ${fonteDosTempos}, e agora toca ${fonte.tipo === 'youtube' ? 'pelo YouTube' : 'o mp3'}. A letra pode sair fora do lugar: marque de novo aqui.`, 9000);
    else if (!marcados && fonte.tipo === 'youtube')
      aviso('Pelo YouTube, a letra anda pelo BPM e pode escorregar. Para ficar certinho, marque os tempos em Editar tocando o vídeo.', 8000);
  });

  $('#play').onclick = () => P.tocando ? pausar() : comecar();
  // começar do começo: volta a música (ou o cronômetro) a 0:00, a letra ao topo, e já toca
  $('#inicio').onclick = async () => {
    if (P.modo === 'manual') { irPara(-1, false); palco.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    pularPara(0); irPara(-1, false);
    palco.scrollTo({ top: 0, behavior: 'smooth' });
    if (!P.tocando) await comecar();
    desenhar();
  };
  // música (ou cronômetro) tocando: as setas andam 5 s; no modo Manual, andam uma linha
  const andar = d => {
    if (P.modo === 'manual') { irPara(P.atual + d, true); return; }
    const dur = duracao() || 1e9;
    pularPara(Math.max(0, Math.min(dur, tempoAtual() + d * 5))); desenhar();
  };
  $('#ant').onclick = () => andar(-1);
  $('#prox').onclick = () => andar(1);
  // ajustes rápidos (BPM e volumes), sempre à mão
  const trava = (v, a, b) => Math.max(a, Math.min(b, v));
  function atualizarRapido() {
    $('#r-bpm').textContent = m.bpm || '—'; $('#r-vol').textContent = dados.prefs.volume; $('#r-cl').textContent = dados.prefs.clique;
  }
  const ajVol = d => {
    dados.prefs.volume = trava(dados.prefs.volume + d, 0, 100);
    if (P.fonte) P.fonte.volume(dados.prefs.volume / 100);
    const v = $('#vol'); if (v) { v.value = dados.prefs.volume; $('#vol-num').textContent = dados.prefs.volume; }
    gravarLocal(); atualizarRapido();
  };
  const ajClique = d => {
    dados.prefs.clique = trava(dados.prefs.clique + d, 0, 100);
    $('#vol-clique').value = dados.prefs.clique; gravarLocal(); mostrarClique();
  };
  $('#r-bpm-').onclick = () => mudarBpm(-2); $('#r-bpm\\+').onclick = () => mudarBpm(2);
  $('#r-vol-').onclick = () => ajVol(-10); $('#r-vol\\+').onclick = () => ajVol(10);
  $('#r-cl-').onclick = () => ajClique(-10); $('#r-cl\\+').onclick = () => ajClique(10);
  P.atualizarRapido = atualizarRapido;
  atualizarRapido();
  $('#ouvir').onclick = () => P.mic ? pararMic() : ouvir();
  const aplicarEscala = v => {
    dados.prefs.escala = Math.round(Math.max(0.7, Math.min(2.2, v)) * 20) / 20;
    document.documentElement.style.setProperty('--escala', dados.prefs.escala);
  };
  const zoom = d => { aplicarEscala(dados.prefs.escala + d); gravarLocal(); };
  // pinça com dois dedos na letra: aumenta ou diminui
  let pinca = null;
  const distDedos = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  palco.addEventListener('touchstart', ev => { if (ev.touches.length === 2) pinca = { d: distDedos(ev.touches), e: dados.prefs.escala }; }, { passive: true });
  palco.addEventListener('touchmove', ev => {
    if (!pinca || ev.touches.length !== 2) return;
    ev.preventDefault(); aplicarEscala(pinca.e * distDedos(ev.touches) / pinca.d);
  }, { passive: false });
  palco.addEventListener('touchend', ev => { if (pinca && ev.touches.length < 2) { pinca = null; gravarLocal(); } });
  // repetir trecho
  function mostrarLaco() {
    const { a, b } = lacoAB;
    $('#laco-liga').setAttribute('aria-pressed', lacoAB.on);
    $('#laco-liga').textContent = lacoAB.on ? 'Repetindo (toque para parar)' : 'Repetir';
    $('#laco-info').textContent = a == null ? 'Nenhum trecho marcado.'
      : b == null ? `Começo em ${mmss(a)}. Falta marcar o fim.` : `Trecho de ${mmss(a)} até ${mmss(b)}.`;
  }
  $('#laco-a').onclick = () => {
    if (P.modo === 'manual') { aviso('Para repetir um trecho, use o modo Música ou Tempo.'); return; }
    lacoAB.a = tempoAtual(); if (lacoAB.b != null && lacoAB.b <= lacoAB.a + 1) { lacoAB.b = null; lacoAB.on = false; }
    mostrarLaco(); desenhar();
  };
  $('#laco-b').onclick = () => {
    if (lacoAB.a == null || tempoAtual() < lacoAB.a + 1) { aviso('Marque primeiro o começo e deixe a música andar um pouco até o fim.'); return; }
    lacoAB.b = tempoAtual(); mostrarLaco(); desenhar();
  };
  $('#laco-liga').onclick = () => {
    if (lacoAB.a == null || lacoAB.b == null) { aviso('Marque o começo e o fim do trecho antes.'); return; }
    lacoAB.on = !lacoAB.on; mostrarLaco(); desenhar();
  };
  $('#laco-limpar').onclick = () => { lacoAB.a = lacoAB.b = null; lacoAB.on = false; mostrarLaco(); desenhar(); };
  mostrarLaco();
  $('#par-esperar').onclick = () => {
    if (P.modo === 'manual') { aviso('Para usar paradas, use o modo Música ou Tempo.'); return; }
    porParada(tempoAtual()); aviso(`Parada em ${mmss(tempoAtual())}: a música vai esperar aqui.`);
  };
  $('#par-repetir').onclick = () => {
    if (lacoAB.a == null || lacoAB.b == null) { aviso('Marque o começo e o fim em "Repetir um trecho" antes.'); return; }
    porParada(lacoAB.b, lacoAB.a);
    lacoAB.a = lacoAB.b = null; lacoAB.on = false; mostrarLaco();
    aviso('Pronto: ao chegar no fim do trecho a música volta ao começo e repete até você tocar Seguir.', 8000);
  };
  mostrarParadas();
  $('#contagem').setAttribute('aria-pressed', !!dados.prefs.contagem);
  $('#contagem').onclick = () => {
    if (!m.bpm) { aviso('Informe o BPM (em Editar ou no + e − do clique) para a contagem funcionar.'); return; }
    dados.prefs.contagem = !dados.prefs.contagem; gravarLocal();
    $('#contagem').setAttribute('aria-pressed', dados.prefs.contagem);
    aviso(dados.prefs.contagem ? `Contagem ligada: ${batidas()} tempos no BPM antes de tocar.` : 'Contagem desligada.');
  };
  $('#menor').onclick = () => zoom(-0.1);
  $('#maior').onclick = () => zoom(0.1);
  montarLetra();
  // faixa: arrastar a marca verde acerta onde a letra começa; tocar em outro ponto pula a música
  let arrastando = false;
  const xParaT = x => Math.max(0, Math.min(duracao(), x / faixa.clientWidth * duracao()));
  faixa.onpointerdown = ev => {
    const ini = inicioLetra(), dur = duracao();
    if (P.fonte && ini != null && dur && Math.abs(ev.offsetX - ini / dur * faixa.clientWidth) < 24) {
      arrastando = true; arrastoT = ini; faixa.setPointerCapture(ev.pointerId); ev.preventDefault();
    }
  };
  faixa.onpointermove = ev => { if (arrastando) { arrastoT = xParaT(ev.offsetX); desenhar(); } };
  faixa.onpointerup = ev => {
    if (arrastando) {
      arrastando = false; const t = arrastoT; arrastoT = null;
      acertarLetra(t); aviso(`A letra agora começa em ${mmss(t)}.`);
      return;
    }
    if (P.modo === 'manual' || !duracao()) return;
    pularPara(xParaT(ev.offsetX));
    desenhar();
  };
  $('#ac-agora').onclick = () => {
    if (!P.fonte || !P.fonte.tocando) { aviso('Toque Tocar e aperte aqui quando o cantor começar a primeira linha.'); return; }
    if (!tempos) { aviso('Marque os tempos ou informe o BPM antes.'); return; }
    acertarLetra(P.fonte.t - 0.12); // desconta o tempo do dedo
    aviso('Pronto: a letra começa aqui nesta música.');
  };
  $('#ac-menos').onclick = () => { if (inicioLetra() != null) acertarLetra(inicioLetra() - 0.5); };
  $('#ac-mais').onclick = () => { if (inicioLetra() != null) acertarLetra(inicioLetra() + 0.5); };
  mostrarAcerto();

  mostrarProxima(); laco();
  P.irPara = irPara; P.tocar = comecar; P.pausar = pausar;
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
  if (botao) { botao.classList.remove('ativo'); botao.querySelector('span').textContent = 'Ouvir a banda'; botao.querySelector('.medidor').hidden = true; }
}

// ---------------- editor ----------------
const PALETA = [
  ['sobe', '! sobe '], ['desce', '! desce '], ['virada', '! virada '], ['prato', '! prato '],
  ['caixa', '! caixa '], ['bumbo', '! bumbo '], ['chimbal', '! chimbal '],
  ['corte', '! corte '], ['conducao', '! condução '], ['pausa', '! para '], ['entra', '! entra '],
  ['livre', '! nota '],
  ['entra', '! entra forte ', 'Começa forte'], ['desce', '! entra fraco ', 'Começa fraco'],
];
const PARTES = ['Intro', 'Verso', 'Pré-refrão', 'Refrão', 'Ponte', 'Solo', 'Final'];
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
      <div class="yt" id="ed-yt" hidden></div>
      <div class="ed-fixo">
      <div class="ed-player">
        <button class="btn" id="ed-inicio" type="button" aria-label="Começar a música do começo" title="Do começo">⏮</button>
        <button class="btn" id="ed-volta" type="button" aria-label="Voltar 5 segundos">− 5 s</button>
        <button class="btn primario" id="ed-play" type="button">${ICONE.play}Ouvir a música</button>
        <button class="btn" id="ed-frente" type="button" aria-label="Avançar 5 segundos">+ 5 s</button>
        <span class="ed-tempo" id="ed-tempo"></span>
      </div>
      <div class="ed-linha" id="ed-linha" hidden>
        <span id="ed-cantando"></span>
        <span class="ed-linha-bts" id="ed-linha-bts" hidden>
          <button class="btn" id="ed-linha-volta" type="button" aria-label="Linha anterior">${ICONE.anterior}</button>
          <button class="btn primario" id="ed-linha-prox" type="button">Próxima linha</button>
        </span>
      </div>
      <div class="ed-alvo" id="ed-alvo" hidden></div>
      <div class="ed-ac" id="ed-ac" hidden aria-label="A letra acompanhando a música"></div>
      <div class="paleta" role="toolbar" aria-label="Inserir marcação acima da linha do cursor">
        ${PALETA.map(([t, ins, rot]) => `<button class="btn" type="button" data-ins="${esc(ins)}" style="--cor:var(--c-${t})">${ICONE[t]}${rot || TIPOS[t]}</button>`).join('')}
        <button class="btn" type="button" data-virar="1" style="--cor:var(--c-livre)">${ICONE.lapis}Linha → nota</button>
      </div>
      <div class="paleta partes" role="toolbar" aria-label="Pôr o nome da parte">
        <span class="rotulo-partes">Partes:</span>
        ${PARTES.map(p => `<button class="btn" type="button" data-ins="# ${p}" style="--cor:var(--text)">${p}</button>`).join('')}
        <button class="btn" type="button" data-ins="# " style="--cor:var(--muted)">Outra</button>
      </div>
      </div>
      <textarea id="f-texto" spellcheck="false" placeholder="Cole a letra aqui, uma frase por linha.&#10;Deixe uma linha em branco entre as partes."></textarea>
      <div class="acoes">
        <a class="btn" id="buscar-letra" target="_blank" rel="noopener">Abrir no Cifra Club</a>
        <a class="btn" id="buscar-versoes" target="_blank" rel="noopener">Procurar versões</a>
        <button class="btn primario" id="colar-letra" type="button">Colar letra</button>
      </div>
      <label class="campo">Link da versão no Cifra Club (opcional)<input id="f-cifra" type="url" inputmode="url" placeholder="https://www.cifraclub.com.br/artista/musica/..." autocomplete="off"></label>
      <p class="dica">Achou a versão certa? Cole o link aqui e o "Abrir no Cifra Club" vai direto nela. Lá, copie a cifra inteira e toque em Colar letra: o app tira os acordes, separa as partes e já escreve as marcações da bateria.</p>
      <p class="dica">Linha que começa com <code>!</code> ou com <code>Bateria</code> vira marcação. A primeira palavra escolhe o ícone: sobe, desce, virada, prato, caixa, bumbo, chimbal, corte, condução, para, entra. <code>! nota</code> é recado livre, em rosa. Linha com <code>#</code> é o nome da parte (Verso, Refrão).</p>

      <section class="bloco">
        <h2>Áudio da música</h2>
        <p class="status" id="a-status"></p>
        <p class="status" id="a-subida" aria-live="polite"></p>
        <canvas class="energia" id="a-energia" aria-hidden="true"></canvas>
        <div class="acoes"><label class="btn">Escolher mp3<input type="file" id="a-arquivo" accept="audio/*" hidden></label>
          <button class="btn perigo" id="a-tirar" type="button" hidden>Tirar o mp3 deste aparelho</button></div>
        <label class="campo">Link do YouTube<input id="f-yt" type="url" inputmode="url" placeholder="https://youtu.be/..." autocomplete="off"></label>
        <label class="campo">Endereço do mp3 no site (opcional)<input id="f-url" placeholder="audio/nome-da-musica.mp3" autocomplete="off"></label>
        <p class="dica">O mp3 escolhido toca na hora e sobe para o site trancado com a sua senha; nos outros aparelhos ele baixa sozinho. Sem mp3, toca pelo YouTube (precisa de internet e pode ter anúncio, que atrasa a letra). O BPM e onde a música enche só saem do mp3.</p>
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
          ${htmlSens()}
          <button class="btn primario" id="premarcar-ed" type="button">Pré-marcar pela música</button>
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
    m.cifra = linkDeVersao(f('cifra').value) || undefined;
    // o mp3 pode ter terminado de subir enquanto ele editava: vale o que está guardado
    const s = dados.locais[m.id];
    if (s) { m.audioNoSite = s.audioNoSite; m.audioSubir = s.audioSubir; }
  }
  const guardarSemSair = () => { lerCampos(); guardar(m); };
  async function atualizarStatus() {
    const temBlob = !!(await Banco.get(m.id));
    m.temAudio = temBlob;
    const a = [];
    const yt = f('yt').value.trim();
    if (temBlob) a.push(m.audioNoSite ? 'Toca o mp3 (guardado também no site, só com a sua senha).' : 'Toca o mp3 deste aparelho.');
    else if (m.audioNoSite) a.push('O mp3 está no site; baixa sozinho quando abrir a música.');
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
    desenharEnergia(cvE, m, null, m.tempos, m.marcas);
  }

  // ---- ouvir a música no Editar: com tempos marcados, o botão colorido entra em cima da linha cantada agora ----
  // sem tempos marcados: ele toca "Próxima linha" quando o cantor muda; isso já vira os tempos da música
  let edNovos = null, edPtr = -1;
  function linhaCantada() {
    if (!edFonte) return -1;
    if (edNovos) return edPtr;
    const tt = ta.value === textoGuardado ? m.tempos : remapear(textoGuardado, ta.value, m.tempos);
    const n = linhasDe(ta.value).length, ef = temposEfetivos({ ...m, tempos: tt }, n, edFonte.tipo);
    if (!ef.marcados) return -1;
    const t = edFonte.t + 0.3;
    let i = -1; while (i + 1 < n && ef.tempos[i + 1] <= t) i++;
    return i;
  }
  function inicioDaLinhaDeLetra(i) { // posição (em caracteres) da i-ésima linha de letra no texto
    let pos = 0, k = 0;
    for (const l of ta.value.split('\n')) {
      const s = l.trim();
      if (s && !s.startsWith('#') && !ehDeixa(s)) { if (k === i) return pos; k++; }
      pos += l.length + 1;
    }
    return -1;
  }
  let edRaf = 0, edTocava = null;
  function edRelogio() {
    if (!edFonte || !document.body.contains(ta)) return;
    $('#ed-tempo').textContent = mmss(edFonte.t) + (edFonte.duracao ? ' / ' + mmss(edFonte.duracao) : '');
    if (edTocava !== edFonte.tocando) {
      edTocava = edFonte.tocando;
      $('#ed-play').innerHTML = edFonte.tocando ? `${ICONE.pause}Pausar` : `${ICONE.play}Tocar`;
    }
    const i = linhaCantada(), lin = linhasDe(ta.value), manual = !!edNovos || !temposMarcadosAntes;
    $('#ed-linha').hidden = !lin.length;
    $('#ed-linha-bts').hidden = !manual;
    $('#ed-cantando').textContent = i >= 0 ? 'Cantando agora: ' + lin[i]
      : manual ? 'Toque Próxima linha quando começar a cantar: ' + (lin[0] || '') : '';
    edAcompanhar(i);
    edRaf = requestAnimationFrame(edRelogio);
  }
  // a letra com o ponto que anda junto com a música: a marcação entra em cima da linha onde o ponto está
  let acTxt = null, acI = -9, acTocando = null, acAlvo = null;
  // alvo escolhido com o dedo (linha e palavra): os botões da bateria entram em cima dele, em vez de seguir a música
  let alvo = null; // { k: linha de letra, w: índice da palavra, palavra }
  let alvoMarca = null; // { r: linha do texto } marcação da bateria escolhida para apagar
  const chaveAlvo = () => (alvo ? alvo.k + ':' + alvo.w : '') + '|' + (alvoMarca ? alvoMarca.r : '');
  function edAcompanhar(i) {
    const box = $('#ed-ac'), v = ta.value, tocando = !!(edFonte && edFonte.tocando);
    if (v === acTxt && i === acI && tocando === acTocando && chaveAlvo() === acAlvo) return; // nada mudou: não redesenha a 60 quadros por segundo
    acTxt = v; acI = i; acTocando = tocando; acAlvo = chaveAlvo();
    const { itens, nLinhas } = interpretar(v);
    box.hidden = !nLinhas;
    mostrarAlvo(nLinhas);
    if (!nLinhas) return;
    box.classList.toggle('parado', !tocando);
    box.classList.toggle('com-alvo', !!alvo || !!alvoMarca);
    const rolAntes = box.scrollTop; // com a linha escolhida, a lista não pode pular de lugar quando redesenha
    box.innerHTML = itens.map(it => {
      if (it.k === 'secao') return `<div class="s">${esc(it.txt)}</div>`;
      if (it.k === 'deixa') return `<div class="d${alvoMarca && alvoMarca.r === it.r ? ' escolhida' : ''}" data-r="${it.r}" style="--cor:var(--c-${it.tipo})">${ICONE[it.tipo] || ''}<span>${esc(it.txt)}</span></div>`;
      if (it.k === 'linha') {
        const ehAlvo = alvo && alvo.k === it.i;
        const palavras = it.txt.split(/\s+/).filter(Boolean).map((p, w) => `<span class="w${ehAlvo && alvo.w === w ? ' alvo' : ''}" data-w="${w}">${esc(p)}</span>`).join(' ');
        return `<div class="l${it.i === i ? ' agora' : ''}${i >= 0 && it.i < i ? ' passou' : ''}${ehAlvo ? ' escolhida' : ''}" data-k="${it.i}">${palavras}</div>`;
      }
      return '';
    }).join('');
    const el = box.querySelector('.escolhida') || box.querySelector('.agora') || box.firstElementChild;
    if (alvo || alvoMarca) box.scrollTop = rolAntes;
    else if (el) box.scrollTop = Math.max(0, el.offsetTop - box.offsetTop - box.clientHeight * 0.4);
  }
  // barrinha em cima da letra: diz onde a marcação vai entrar e deixa tocar dali ou soltar
  function mostrarAlvo(nLinhas) {
    const el = $('#ed-alvo');
    if (alvoMarca && nLinhas) {
      el.hidden = false;
      el.innerHTML = `<span>Marcação escolhida: <b>${esc(alvoMarca.txt)}</b></span>
        <span class="ed-alvo-bts"><button class="btn perigo" type="button" id="alvo-apagar-uma">Apagar esta marcação</button><button class="btn" type="button" id="alvo-soltar">Fechar</button></span>`;
      $('#alvo-soltar').onclick = () => { alvoMarca = null; edAcompanhar(linhaCantada()); };
      $('#alvo-apagar-uma').onclick = () => apagarLinhaDoTexto(alvoMarca.r);
      return;
    }
    if (!alvo || !nLinhas) { el.hidden = true; return; }
    const quantas = marcasEmCima(alvo.k).length;
    el.hidden = false;
    el.innerHTML = `<span>Marcação entra em cima de: <b>${esc(linhasDe(ta.value)[alvo.k] || '')}</b>${alvo.w > 0 ? ` (na palavra <b>${esc(alvo.palavra)}</b>)` : ''}</span>
      <span class="ed-alvo-bts"><button class="btn" type="button" id="alvo-tocar">Tocar daqui</button>
      ${quantas ? `<button class="btn perigo" type="button" id="alvo-apagar">Apagar ${quantas === 1 ? 'a marcação' : quantas + ' marcações'} de cima</button>` : ''}
      <button class="btn" type="button" id="alvo-soltar">Seguir a música</button></span>`;
    $('#alvo-soltar').onclick = () => { alvo = null; edAcompanhar(linhaCantada()); };
    const ap = $('#alvo-apagar'); if (ap) ap.onclick = () => apagarMarcasDe(alvo.k);
    $('#alvo-tocar').onclick = async () => {
      if (!edFonte) { await $('#ed-play').onclick(); if (edFonte && edFonte.tocando) edFonte.pause(); }
      if (!edFonte) return;
      const n = linhasDe(ta.value).length, ef = temposEfetivos({ ...m, tempos: ta.value === textoGuardado ? m.tempos : remapear(textoGuardado, ta.value, m.tempos) }, n, edFonte.tipo);
      if (!ef.tempos) { aviso('Sem tempos ainda: marque a letra tocando junto primeiro.'); return; }
      edFonte.t = Math.max(0, ef.tempos[alvo.k] - 1);
      if (!edFonte.tocando) { try { await edFonte.play(); } catch {} }
    };
  }
  // as marcações da bateria coladas em cima de uma linha de letra: [{ ini, fim }] (posições no texto), de baixo para cima
  function marcasEmCima(k) {
    const v = ta.value, achadas = [];
    let corte = inicioDaLinhaDeLetra(k);
    while (corte > 0) {
      const antes = v.lastIndexOf('\n', corte - 2) + 1, l = v.slice(antes, corte - 1).trim();
      if (!ehDeixa(l)) break;
      achadas.push({ ini: antes, fim: corte }); corte = antes;
    }
    return achadas;
  }
  // tira um trecho do texto sem a tela pular; a letra de baixo sobe e o padrão (marcações coladas na linha) continua
  function cortarTexto(ini, fim) {
    const tela = ta.closest('.rolagem'), rolTela = tela.scrollTop, rolTexto = ta.scrollTop;
    ta.value = ta.value.slice(0, ini) + ta.value.slice(fim);
    ta.scrollTop = rolTexto; tela.scrollTop = rolTela;
  }
  function apagarMarcasDe(k) {
    const a = marcasEmCima(k); if (!a.length) return;
    cortarTexto(a[a.length - 1].ini, a[0].fim);
    aviso(a.length === 1 ? 'Marcação apagada. A linha de baixo subiu.' : `${a.length} marcações apagadas. A linha de baixo subiu.`, 3000);
    edAcompanhar(linhaCantada());
  }
  function apagarLinhaDoTexto(r) {
    const linhas = ta.value.split('\n'); if (r >= linhas.length) return;
    let ini = 0; for (let j = 0; j < r; j++) ini += linhas[j].length + 1;
    cortarTexto(ini, ini + linhas[r].length + 1);
    alvoMarca = null; aviso('Marcação apagada. A linha de baixo subiu.', 3000);
    edAcompanhar(linhaCantada());
  }
  // tocar numa palavra da letra: a marcação passa a entrar em cima dessa linha (toque de novo para soltar)
  $('#ed-ac').onclick = ev => {
    const d = ev.target.closest('.d');
    if (d) { // tocou numa marcação da bateria: dá para apagar só ela
      const r = +d.dataset.r;
      alvo = null; alvoMarca = alvoMarca && alvoMarca.r === r ? null : { r, txt: d.textContent.trim() };
      edAcompanhar(linhaCantada()); return;
    }
    const l = ev.target.closest('.l'); if (!l) return;
    const k = +l.dataset.k, wEl = ev.target.closest('.w'), w = wEl ? +wEl.dataset.w : 0;
    alvoMarca = null;
    alvo = alvo && alvo.k === k && alvo.w === w ? null : { k, w, palavra: wEl ? wEl.textContent : '' };
    edAcompanhar(linhaCantada());
  };
  ta.addEventListener('input', () => { if (alvo && alvo.k >= linhasDe(ta.value).length) alvo = null; alvoMarca = null; edAcompanhar(linhaCantada()); });
  edAcompanhar(-1);
  let temposMarcadosAntes = false;
  $('#ed-linha-prox').onclick = () => {
    if (!edFonte || !edFonte.tocando) { aviso('Toque em Tocar primeiro.'); return; }
    const n = linhasDe(ta.value).length;
    if (!edNovos) { edNovos = new Array(n).fill(null); edPtr = -1; }
    if (edPtr >= n - 1) { aviso('Essa já é a última linha.'); return; }
    edPtr++; edNovos[edPtr] = Math.max(0, Math.round((edFonte.t - 0.12) * 100) / 100);
    // vira os tempos da música (o texto atual é a referência deles)
    m.tempos = edNovos.slice(); m.temposFonte = edFonte.tipo; textoGuardado = ta.value;
    m.ajusteLetra = { ...(m.ajusteLetra || {}), [edFonte.tipo]: 0 }; // tempos novos já vêm certos para esta música
  };
  $('#ed-linha-volta').onclick = () => {
    if (!edNovos || edPtr < 0) return;
    edNovos[edPtr] = null; edPtr--;
    m.tempos = edNovos.slice(); textoGuardado = ta.value;
  };
  $('#ed-play').onclick = async () => {
    if (!edFonte) {
      lerCampos();
      const b = $('#ed-play'); b.disabled = true; b.textContent = 'Carregando a música…';
      edFonte = await abrirFonte(m, $('#ed-yt'));
      b.disabled = false; b.innerHTML = `${ICONE.play}Ouvir a música`;
      if (!edFonte) { aviso('Esta música ainda não tem mp3. Ponha em "Escolher mp3" lá embaixo, ou escolha YouTube no palco.', 8000); return; }
      edFonte.volume(dados.prefs.volume / 100);
      temposMarcadosAntes = temposEfetivos(m, linhasDe(ta.value).length, edFonte.tipo).marcados;
      edTocava = null; cancelAnimationFrame(edRaf); edRelogio();
      if (!linhasDe(ta.value).length) aviso('Cole a letra para ir marcando em cima dela.');
      else if (!temposMarcadosAntes)
        aviso('Toque "Próxima linha" sempre que o cantor mudar de linha. Os botões coloridos entram em cima da linha cantada.', 9000);
    }
    if (edFonte.tocando) edFonte.pause();
    else { try { await edFonte.play(); } catch { aviso('Toque de novo para a música começar.'); } }
  };
  $('#ed-inicio').onclick = async () => {
    if (!edFonte) { await $('#ed-play').onclick(); } // abre a música (e já toca) se ainda não abriu
    if (!edFonte) return;
    edFonte.t = 0; if (edNovos) { edNovos = null; edPtr = -1; }
    if (!edFonte.tocando) { try { await edFonte.play(); } catch {} }
  };
  $('#ed-volta').onclick = () => { if (edFonte) edFonte.t = Math.max(0, edFonte.t - 5); };
  $('#ed-frente').onclick = () => { if (edFonte) edFonte.t = edFonte.t + 5; };

  app.querySelectorAll('.paleta button').forEach(b => b.onclick = () => {
    let ins = b.dataset.ins; const v = ta.value, pos = ta.selectionStart;
    let ini = v.lastIndexOf('\n', pos - 1) + 1;   // começo da linha do cursor
    // linha escolhida com o dedo na letra: vale ela. Senão, música tocando e tempos marcados: a linha cantada agora
    const comAlvo = !!alvo && alvo.k < linhasDe(v).length;
    const cantada = comAlvo ? alvo.k : (!b.dataset.virar && edFonte && edFonte.tocando ? linhaCantada() : -1);
    // palavra escolhida (não a primeira): a marcação diz em qual palavra entra
    if (comAlvo && alvo.w > 0 && alvo.palavra && /^!/.test(ins)) ins = ins.trimEnd() + ` na palavra "${alvo.palavra.replace(/[",.;:!?…]+$/g, '')}" `;
    if (comAlvo && b.dataset.virar) { const p = inicioDaLinhaDeLetra(cantada); if (p >= 0) ini = p; }
    if (cantada >= 0) {
      const p = inicioDaLinhaDeLetra(cantada); if (p >= 0) ini = p;
      // nome de parte vai acima das marcações que já estão em cima da linha
      if (ins.startsWith('#')) {
        while (ini > 0) {
          const antes = v.lastIndexOf('\n', ini - 2) + 1, l = v.slice(antes, ini - 1).trim();
          if (!ehDeixa(l)) break;
          ini = antes;
        }
      }
    }
    if (b.dataset.virar) {
      // a linha do cursor vira anotação (cor própria); se já for, volta a ser letra
      let fimL = v.indexOf('\n', ini); if (fimL < 0) fimL = v.length;
      const linha = v.slice(ini, fimL);
      const nova = /^\s*!\s*nota\s+/i.test(linha) ? linha.replace(/^\s*!\s*nota\s+/i, '') : '! nota ' + linha.replace(/^\s*!\s*/, '');
      const tela = ta.closest('.rolagem'), rolTela = tela.scrollTop, rolTexto = ta.scrollTop;
      ta.value = v.slice(0, ini) + nova + v.slice(fimL);
      ta.focus({ preventScroll: true }); ta.setSelectionRange(ini + nova.length, ini + nova.length);
      ta.scrollTop = rolTexto; tela.scrollTop = rolTela;
      edAcompanhar(linhaCantada());
      return;
    }
    // a tela fica parada: trocar o texto faria o navegador pular para o topo ou para o cursor
    const tela = ta.closest('.rolagem'), rolTela = tela.scrollTop, rolTexto = ta.scrollTop;
    ta.value = v.slice(0, ini) + ins + '\n' + v.slice(ini);
    const cursor = ini + ins.length;
    if (cantada >= 0) { // tocando: não abre o teclado do celular; só mostra onde entrou
      aviso(`Marcado em cima de: ${linhasDe(ta.value)[cantada]}`, 2500);
    } else ta.focus({ preventScroll: true });
    ta.setSelectionRange(cursor, cursor);
    ta.scrollTop = rolTexto; tela.scrollTop = rolTela;
    edAcompanhar(linhaCantada()); // a marcação nova já aparece na letra de cima
  });

  $('#a-arquivo').onchange = async ev => {
    const arq = ev.target.files[0]; if (!arq) return;
    lerCampos();
    const subida = $('#a-subida');
    try { await receberMp3(m, arq, t => { subida.textContent = t; }); }
    catch { aviso('Não consegui guardar esse arquivo. Tente um mp3.'); }
    f('bpm').value = m.bpm || '';
    atualizarStatus();
  };

  $('#marcar').onclick = async () => {
    lerCampos();
    const lin = linhasDe(m.texto);
    if (!lin.length) { aviso('Cole a letra antes de marcar os tempos.'); return; }
    marcarTempos(lin, m, (tempos, fonteTipo, marcasNovas, solosNovos) => {
      if (!tempos || (!tempos.length && !marcasNovas)) return;
      if (tempos.length) {
        if (solosNovos) { m.solos = solosNovos; solosNovos.forEach(sl => { ta.value = inserirSecaoAntes(ta.value, sl.k, 'Solo'); }); }
        else delete m.solos;
      }
      if (marcasNovas) { m.marcas = marcasNovas; m.marcasFonte = fonteTipo; }
      if (!tempos.length) { guardarSemSair(); atualizarStatus(); aviso(`${marcasNovas.length} marcação(ões) da bateria guardadas.`); return; }
      m.tempos = lin.map((_, i) => tempos[i] ?? null);
      m.temposFonte = fonteTipo;
      m.ajusteLetra = { ...(m.ajusteLetra || {}), [fonteTipo]: 0 };
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
  ligarSens(app);
  $('#premarcar-ed').onclick = () => {
    lerCampos();
    const novas = premarcarPeloAudio(m, dados.prefs.sens ?? 1);
    if (!novas) { aviso('Preciso do mp3 analisado: escolha o mp3 desta música em "Áudio da música".', 8000); return; }
    const n = aplicarPremarcas(m, novas);
    if (!n) { aviso('Não achei mudanças claras na música. Marque na mão com "Gravar a bateria ouvindo", no palco.', 8000); return; }
    guardarSemSair(); atualizarStatus();
    aviso(`${n} marcação(ões) pré-marcada(s) (fitas coloridas na faixa do áudio). Abra a música no palco e toque em "Gravar a bateria ouvindo" para ouvir e ajustar.`, 12000);
  };
  $('#sug-desfazer').onclick = () => { if (desfazerTexto != null) { ta.value = desfazerTexto; desfazerTexto = null; $('#sug-desfazer').hidden = true; } };

  $('#salvar').onclick = () => { guardarSemSair(); location.hash = voltarPara(m.id); };
  if (!nova) $('#apagar').onclick = () => {
    if (confirm(`Apagar "${m.titulo}" deste aparelho?`)) { apagarMusica(m.id); location.hash = '#/'; }
  };
  $('#a-tirar').onclick = async () => {
    if (!confirm('Tirar o mp3 deste aparelho' + (m.audioNoSite ? ' e do site?' : '?'))) return;
    await Banco.del(m.id);
    if (m.audioNoSite) Nuvem.apagarAudio(m.id);
    delete m.energia; delete m.duracao; delete m.primeiroSom; delete m.audioSubir; m.audioNoSite = false;
    $('#a-subida').textContent = '';
    guardarSemSair(); atualizarStatus();
  };
  // abre a pesquisa da letra em outra aba; o Lucas copia e cola aqui
  const linkLetra = () => {
    $('#buscar-letra').href = urlCifra(f('titulo').value.trim(), f('artista').value.trim(), f('cifra').value);
    $('#buscar-versoes').href = buscaVersoes(f('titulo').value.trim(), f('artista').value.trim());
  };
  f('cifra').value = m.cifra || '';
  f('cifra').oninput = () => {
    linkLetra();
    const v = f('cifra').value.trim();
    f('cifra').setCustomValidity(v && !linkDeVersao(v) ? 'Cole um link do Cifra Club (cifraclub.com.br) ou do Letras (letras.mus.br).' : '');
    f('cifra').reportValidity();
  };
  $('#colar-letra').onclick = async () => {
    const letra = await lerLetraCopiada();
    if (!letra) return;
    desfazerTexto = ta.value;
    const base = ta.value.trim() ? ta.value.replace(/\s+$/, '') + '\n\n' + letra : letra;
    const { texto, inseridas } = letraComMarcacoes(base);
    ta.value = texto;
    $('#sug-desfazer').hidden = false;
    aviso(inseridas ? `Letra colada, com ${inseridas} marcação(ões) da bateria. Confira e ajuste.` : 'Letra colada.');
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

// tela cheia: a música toca e o Lucas toca o botão da mudança na hora em que a bateria muda.
// Cada toque vira {t, tipo}; a lista deixa ajustar meio segundo, ouvir de novo e apagar.
const TIPOS_GRAVAR = ['sobe', 'desce', 'virada', 'prato', 'caixa', 'bumbo', 'chimbal', 'corte', 'pausa', 'entra'];
async function gravarMarcacoes(m, fim) {
  const el = document.createElement('div');
  el.className = 'marcar gravar';
  el.innerHTML = `
    <div class="yt" id="g-yt" hidden></div>
    <div class="m-topo"><span id="g-linha" class="g-linha"></span><span id="g-tempo">0:00</span></div>
    <div class="g-letra" id="g-letra" hidden>
      <p class="g-agora" id="g-agora"></p>
      <p class="g-seguinte" id="g-seguinte"></p>
      <div class="g-linha-bts">
        <button class="btn" id="g-linha-volta" type="button">Linha anterior</button>
        <button class="btn primario" id="g-linha-prox" type="button">Próxima linha</button>
      </div>
    </div>
    <div class="g-tipos">${TIPOS_GRAVAR.map(t => `<button class="btn" data-t="${t}" style="--cor:var(--c-${t})">${ICONE[t]}${TIPOS[t]}</button>`).join('')}</div>
    <div class="g-transporte">
      <button class="btn" id="g-volta" aria-label="Voltar 5 segundos">− 5 s</button>
      <button class="btn primario" id="g-play"></button>
      <button class="btn" id="g-frente" aria-label="Avançar 5 segundos">+ 5 s</button>
    </div>
    <ol class="g-lista" id="g-lista"></ol>
    <div class="acoes"><button class="btn" id="g-cancelar">Cancelar</button><button class="btn primario" id="g-ok">Salvar marcações</button></div>`;
  document.body.appendChild(el);
  const play = $('#g-play', el);
  play.textContent = 'Carregando a música…'; play.disabled = true;
  const marcas = (m.marcas || []).map(x => ({ ...x }));
  const fonte = await abrirFonte(m, $('#g-yt', el));
  if (!fonte) { el.remove(); aviso('Para gravar ouvindo, a música precisa de mp3 (Pôr o mp3) ou de link do YouTube.', 7000); fim(null); return; }
  fonte.volume(dados.prefs.volume / 100);
  play.disabled = false;
  const linhas = linhasDe(m.texto), tem = temposEfetivos(m, linhas.length, fonte.tipo);
  const lista = $('#g-lista', el);
  let raf = 0, saiu = false, tocandoAntes = null;
  // letra sem tempos: na mesma passada ele toca "Próxima linha" quando o cantor muda de linha.
  // É isso que diz ao app em que linha cai cada marcação.
  const marcandoLinhas = linhas.length > 0 && !tem.marcados;
  const novos = new Array(linhas.length).fill(null);
  let ptr = -1;
  const mostrarLinhaAtual = () => {
    $('#g-agora', el).textContent = ptr >= 0 ? linhas[ptr] : 'Toque Próxima linha quando começar: ' + linhas[0];
    $('#g-seguinte', el).textContent = linhas[ptr + 1] ? 'depois: ' + linhas[ptr + 1] : (ptr >= 0 ? 'última linha' : '');
  };
  const acharPtr = () => { // depois de voltar a música, a linha atual acompanha
    let k = -1; novos.forEach((x, i) => { if (x != null && x <= fonte.t + 0.1) k = i; });
    ptr = k; mostrarLinhaAtual();
  };
  if (marcandoLinhas) {
    $('#g-letra', el).hidden = false;
    $('#g-linha-prox', el).onclick = () => {
      if (!fonte.tocando) { aviso('Toque em Tocar primeiro.'); return; }
      if (ptr >= linhas.length - 1) { aviso('Essa já é a última linha.'); return; }
      ptr++; novos[ptr] = Math.max(0, Math.round((fonte.t - 0.12) * 100) / 100);
      mostrarLinhaAtual();
    };
    $('#g-linha-volta', el).onclick = () => { if (ptr >= 0) { novos[ptr] = null; ptr--; mostrarLinhaAtual(); } };
    mostrarLinhaAtual();
  }
  function desenharLista() {
    marcas.sort((a, b) => a.t - b.t);
    lista.innerHTML = marcas.length ? marcas.map((x, i) => `
      <li><span class="g-t">${mmss(x.t)}<small>,${Math.floor((x.t % 1) * 10)}</small></span>
        <span class="mini" style="--cor:var(--c-${x.tipo})">${ICONE[x.tipo]}${esc(TIPOS[x.tipo] + (x.det ? ' ' + x.det : ''))}</span>
        <span class="g-acoes">
          <button class="btn icone" data-menos="${i}" aria-label="Meio segundo antes">−½</button>
          <button class="btn icone" data-mais="${i}" aria-label="Meio segundo depois">+½</button>
          <button class="btn" data-ouvir="${i}">Ouvir</button>
          <button class="btn icone perigo" data-tirar="${i}" aria-label="Apagar">${ICONE.fechar}</button>
        </span></li>`).join('')
      : '<li class="dica">Toque em Tocar. Quando a bateria mudar, toque o botão da mudança. Errou o momento? Use −½ e +½, e Ouvir para conferir.</li>';
  }
  lista.onclick = ev => {
    const b = ev.target.closest('button'); if (!b) return;
    const d = b.dataset;
    if (d.menos) marcas[+d.menos].t = Math.max(0, Math.round((marcas[+d.menos].t - 0.5) * 100) / 100);
    else if (d.mais) marcas[+d.mais].t = Math.round((marcas[+d.mais].t + 0.5) * 100) / 100;
    else if (d.ouvir) { fonte.t = Math.max(0, marcas[+d.ouvir].t - 3); fonte.play().catch(() => {}); if (marcandoLinhas) acharPtr(); }
    else if (d.tirar) marcas.splice(+d.tirar, 1);
    desenharLista();
  };
  el.querySelectorAll('.g-tipos [data-t]').forEach(b => b.onclick = () => {
    if (!fonte.tocando) { aviso('Toque em Tocar primeiro.'); return; }
    marcas.push({ t: Math.max(0, Math.round((fonte.t - 0.15) * 100) / 100), tipo: b.dataset.t }); // desconta o tempo do dedo
    desenharLista();
    b.classList.remove('pisca'); void b.offsetWidth; b.classList.add('pisca');
  });
  play.onclick = async () => { if (fonte.tocando) fonte.pause(); else { try { await fonte.play(); } catch { aviso('Toque de novo para a música começar.'); } } };
  $('#g-volta', el).onclick = () => { fonte.t = Math.max(0, fonte.t - 5); if (marcandoLinhas) setTimeout(acharPtr, 50); };
  $('#g-frente', el).onclick = () => { fonte.t = fonte.t + 5; };
  function relogio() {
    if (saiu) return;
    const t = fonte.t;
    $('#g-tempo', el).textContent = mmss(t) + (fonte.duracao ? ' / ' + mmss(fonte.duracao) : '');
    let linha = '';
    if (tem.marcados) {
      let i = -1; while (i + 1 < linhas.length && tem.tempos[i + 1] <= t + 0.2) i++;
      linha = i >= 0 ? linhas[i] : (linhas[0] ? 'Antes de: ' + linhas[0] : '');
    }
    $('#g-linha', el).textContent = linha;
    if (tocandoAntes !== fonte.tocando) { tocandoAntes = fonte.tocando; play.innerHTML = fonte.tocando ? `${ICONE.pause}Pausar` : `${ICONE.play}Tocar`; }
    raf = requestAnimationFrame(relogio);
  }
  function sair(salvar) {
    saiu = true; cancelAnimationFrame(raf); fonte.destruir(); el.remove();
    const marcadas = novos.filter(x => x != null).length;
    fim(salvar ? marcas.sort((a, b) => a.t - b.t) : null, fonte.tipo, salvar && marcadas >= 2 ? novos : null);
  }
  $('#g-cancelar', el).onclick = () => { if (marcas.length && !confirm('Sair sem salvar as marcações?')) return; sair(false); };
  $('#g-ok', el).onclick = () => sair(true);
  desenharLista(); relogio();
}

// tela cheia: toca a música (ou cronometra) e cada toque marca o começo da próxima linha
async function marcarTempos(linhas, m, fim) {
  const el = document.createElement('div');
  el.className = 'marcar';
  el.innerHTML = `
    <div class="yt" id="m-yt" hidden></div>
    <div class="m-topo"><span id="m-cont"></span><span id="m-tempo">0:00</span></div>
    <div class="m-progresso" aria-hidden="true"><i id="m-prog"></i></div>
    <p class="m-info" id="m-info" aria-live="polite"></p>
    <div class="m-lista" id="m-lista" aria-label="Letra com os tempos marcados"></div>
    <div class="m-edicao" id="m-edicao" hidden></div>
    <button class="btn primario enorme" id="m-toque"></button>
    <button class="btn" id="m-solo" type="button" hidden></button>
    <div class="g-tipos m-tipos-h" id="m-tipos">${TIPOS_GRAVAR.map(t => `<button class="btn" type="button" data-t="${t}" style="--cor:var(--c-${t})">${ICONE[t]}${TIPOS[t]}</button>`).join('')}</div>
    <p class="m-depois" id="m-marcas"></p>
    <div class="m-controle" id="m-controle" hidden>
      <input type="range" id="m-pos" min="0" max="0" step="0.1" value="0" aria-label="Ponto da música">
      <div class="acoes">
        <button class="btn" id="m-menos" type="button">◀ 10 s</button>
        <button class="btn" id="m-pausa" type="button">Pausar</button>
        <button class="btn" id="m-mais" type="button">10 s ▶</button>
      </div>
    </div>
    <div class="acoes">
      <button class="btn" id="m-desfazer">Desfazer</button>
      <button class="btn" id="m-cancelar">Cancelar</button>
      <button class="btn" id="m-ok">Concluir</button>
    </div>`;
  document.body.appendChild(el);
  const toque = $('#m-toque', el);
  const tempos = []; let t0 = null, raf = 0, comecou = false, saiu = false;
  // bateria na mesma passada: cada botão grava uma marcação no segundo exato; o "Desfazer" desfaz o último toque (linha ou bateria)
  const marcas = (m.marcas || []).map(x => ({ ...x })), antigas = marcas.length, hist = [];
  // solo / instrumental: o tempo fica "segurado" até ele tocar no começo da linha em que a música volta a cantar
  const solos = []; let solo = null;
  toque.textContent = 'Carregando a música…'; toque.disabled = true;
  const fonte = await abrirFonte(m, $('#m-yt', el));
  if (saiu) { if (fonte) fonte.destruir(); return; }
  toque.disabled = false;
  if (fonte) fonte.volume(dados.prefs.volume / 100);
  const t = () => fonte ? fonte.t : t0 == null ? 0 : (agora() - t0) / 1000;
  // ---- a letra à vista: cada linha mostra quando começa e quanto durou; a cor vai preenchendo conforme ele marca ----
  const dec = x => mmss(x) + ',' + Math.floor((x % 1) * 10);
  const seg = x => x.toFixed(1).replace('.', ',') + ' s';
  const lista = $('#m-lista', el), edicao = $('#m-edicao', el);
  let sel = -1, ultimo = '', piscar = -1; // sel = linha já marcada que ele escolheu para ajustar
  let inicioT = null; // segundo da música em que ele apertou Tocar: a introdução vai daí até ele marcar que começou a cantar
  const pct = d => Math.max(4, Math.min(100, d / 10 * 100)) + '%'; // barra: 10 s = linha cheia
  function desenharLista() {
    const k = tempos.length, soloDe = new Map(solos.map(x => [x.k, x]));
    lista.innerHTML = linhas.map((txt, i) => {
      const marcada = i < k, proxima = i === k;
      const durou = marcada && i + 1 < k ? tempos[i + 1] - tempos[i] : null;
      const est = marcada ? (i === k - 1 ? 'cantando' : 'feita') : proxima ? 'proxima' : 'pendente';
      const s0 = soloDe.get(i);
      let pre = '';
      if (i === 0 && comecou && inicioT != null) { // introdução: do Tocar até o primeiro toque ("começou a cantar")
        if (k > 0) { const d = tempos[0] - inicioT; pre += `<div class="m-l solo feita"><i class="fill" style="width:${pct(d)}"></i><span class="n">♪</span><span class="tx">Introdução (antes de cantar)</span><span class="tm">${dec(inicioT)}</span><span class="dd">durou ${seg(d)}</span></div>`; }
        else if (!solo) pre += `<div class="m-l solo vivo intro"><i class="fill" style="width:4%"></i><span class="n">♪</span><span class="tx">Introdução… toque quando começar a cantar</span><span class="tm">${dec(inicioT)}</span><span class="dd">há 0,0 s</span></div>`;
      }
      if (s0) { const d = tempos[i] - s0.t; pre += `<div class="m-l solo feita"><i class="fill" style="width:${pct(d)}"></i><span class="n">♪</span><span class="tx">Solo / instrumental</span><span class="tm">${dec(s0.t)}</span><span class="dd">durou ${seg(d)}</span></div>`; }
      else if (proxima && solo) pre += `<div class="m-l solo vivo"><i class="fill" style="width:4%"></i><span class="n">♪</span><span class="tx">Instrumental…</span><span class="tm">${dec(solo.t)}</span><span class="dd">há 0,0 s</span></div>`;
      const dd = durou != null ? `durou ${seg(durou)}` : est === 'cantando' ? 'há 0,0 s' : '';
      const tm = marcada ? dec(tempos[i]) : proxima ? '← agora?' : '';
      const largura = durou != null ? pct(durou) : est === 'cantando' ? '4%' : '0';
      return pre + `<div class="m-l ${est}${sel === i ? ' sel' : ''}${piscar === i ? ' flash' : ''}" data-i="${i}"><i class="fill" style="width:${largura}"></i><span class="n">${i + 1}</span><span class="tx">${esc(txt)}</span><span class="tm">${tm}</span><span class="dd">${dd}</span></div>`;
    }).join('');
    piscar = -1;
    if (sel < 0) { // mantém a linha da vez à vista
      const alvo = lista.querySelector('.m-l.proxima') || lista.querySelector('.m-l.cantando');
      if (alvo) lista.scrollTop = Math.max(0, alvo.offsetTop - lista.clientHeight * 0.4);
    }
  }
  // enquanto a linha canta, o tempo e a barra crescem ao vivo
  function atualizarVivo() {
    if (!comecou || !(fonte ? fonte.tocando : true)) return;
    const k = tempos.length;
    const v = lista.querySelector('.m-l.cantando'), sv = lista.querySelector('.m-l.vivo');
    if (v && k > 0) { const d = Math.max(0, t() - tempos[k - 1]); v.querySelector('.dd').textContent = 'há ' + seg(d); v.querySelector('.fill').style.width = pct(d); }
    const ini = sv ? (sv.classList.contains('intro') ? inicioT : solo && solo.t) : null;
    if (sv && ini != null) { const d = Math.max(0, t() - ini); sv.querySelector('.dd').textContent = 'há ' + seg(d); sv.querySelector('.fill').style.width = pct(d); }
  }
  function mostrarEdicao() {
    if (sel < 0 || sel >= tempos.length) { sel = -1; edicao.hidden = true; return; }
    edicao.hidden = false;
    edicao.innerHTML = `<span>Linha ${sel + 1} começa em <b>${dec(tempos[sel])}</b>. Ajuste, ouça ou refaça dali.</span>
      <div class="m-ed-bts">
        <button class="btn" type="button" data-d="-0.5">−0,5 s</button><button class="btn" type="button" data-d="-0.1">−0,1</button>
        <button class="btn" type="button" data-d="0.1">+0,1</button><button class="btn" type="button" data-d="0.5">+0,5 s</button>
        <button class="btn" type="button" data-a="ouvir">Ouvir daqui</button>
        <button class="btn perigo" type="button" data-a="refazer">Refazer a partir daqui</button>
        <button class="btn" type="button" data-a="fechar">Fechar</button>
      </div>`;
  }
  lista.onclick = ev => {
    const r = ev.target.closest('.m-l[data-i]'); if (!r) return;
    const i = +r.dataset.i; if (i >= tempos.length) return; // só dá para mexer nas já marcadas
    sel = sel === i ? -1 : i; desenharLista(); mostrarEdicao();
  };
  edicao.onclick = ev => {
    const b = ev.target.closest('button'); if (!b || sel < 0) return;
    if (b.dataset.d) {
      tempos[sel] = Math.max(0, Math.round((tempos[sel] + parseFloat(b.dataset.d)) * 100) / 100);
      solos.forEach(x => { if (x.k === sel) x.fim = tempos[sel]; });
      piscar = sel; desenharLista(); mostrarEdicao(); return;
    }
    const a = b.dataset.a;
    if (a === 'fechar') { sel = -1; desenharLista(); mostrarEdicao(); return; }
    if (a === 'ouvir') {
      if (!fonte) { aviso('Sem música para ouvir aqui: este modo é só o cronômetro.'); return; }
      fonte.t = Math.max(0, tempos[sel] - 1.5); fonte.play().catch(() => {}); return;
    }
    if (a === 'refazer') {
      const de = sel, ref = Math.max(0, tempos[de] - 3);
      tempos.length = de;
      for (let j = solos.length - 1; j >= 0; j--) if (solos[j].k >= de) solos.splice(j, 1);
      hist.length = 0; solo = null; sel = -1; ultimo = '';
      if (fonte) { fonte.t = ref; fonte.play().catch(() => {}); } else t0 = agora() - ref * 1000;
      comecou = true; mostrar(); mostrarEdicao();
      aviso(`Voltei uns 3 s antes da linha ${de + 1}. Toque quando o cantor começar essa linha.`, 5000);
    }
  };
  function mostrar() {
    const k = tempos.length;
    $('#m-cont', el).textContent = `${Math.min(k, linhas.length)} de ${linhas.length} linhas marcadas`;
    $('#m-prog', el).style.width = (linhas.length ? k / linhas.length * 100 : 0) + '%';
    const guia = !comecou ? 'Como funciona: 1) toque no botão grande para a música começar. 2) Um toque por linha da letra, no botão grande, quando o cantor COMEÇA a cantar aquela linha (nunca no fim). A linha fica verde e mostra quanto durou. Errou? Toque na linha marcada para ajustar ou refazer dali.'
      : solo ? 'Instrumental rolando. Toque quando o cantor voltar a cantar.'
      : k === 0 ? 'Introdução rolando. Toque no botão grande no instante em que o cantor COMEÇAR a primeira linha: esse é o começo da letra.'
      : k < linhas.length ? 'Um toque por linha, no botão grande, no instante em que o cantor começa a linha da borda amarela. Nunca no fim: o fim de uma linha é o começo da próxima.' : 'Todas as linhas marcadas! Toque em Concluir.';
    $('#m-info', el).innerHTML = (ultimo ? `<b>${esc(ultimo)}</b> ` : '') + esc(guia);
    toque.textContent = !comecou ? (fonte ? 'Tocar a música' : 'Começar quando a música começar')
      : solo ? 'Voltou a cantar: toque agora' : k === 0 ? 'COMEÇOU a cantar: toque agora' : k < linhas.length ? 'COMEÇOU esta linha: toque agora' : 'Concluir';
    const bs = $('#m-solo', el);
    bs.hidden = !comecou || k >= linhas.length;
    bs.textContent = solo ? 'Cancelar o solo' : 'Solo / instrumental: segurar o tempo';
    bs.classList.toggle('ativo', !!solo);
    const novas = marcas.length - antigas, ult = marcas[marcas.length - 1];
    $('#m-marcas', el).textContent = novas > 0 ? `${novas} marcação(ões) da bateria nesta passada. Última: ${TIPOS[ult.tipo]} em ${mmss(ult.t)}.` : 'Bateria: toque o botão da mudança na hora em que ela acontece.';
    desenharLista();
  }
  const pos = $('#m-pos', el), pausa = $('#m-pausa', el);
  let arrastandoPos = false;
  function relogio() {
    $('#m-tempo', el).textContent = fonte ? `${mmss(t())} / ${mmss(fonte.duracao)}` : mmss(t());
    if (fonte && !arrastandoPos) {
      const d = fonte.duracao || 0;
      if (+pos.max !== d) pos.max = d;
      pos.value = t();
    }
    if (fonte && comecou) pausa.textContent = fonte.tocando ? 'Pausar' : 'Continuar';
    atualizarVivo();
    raf = requestAnimationFrame(relogio);
  }
  // pular para outro ponto (ou pausar e continuar) sem perder o que já foi marcado
  if (fonte) {
    $('#m-controle', el).hidden = false;
    pos.oninput = () => { arrastandoPos = true; $('#m-tempo', el).textContent = `${mmss(+pos.value)} / ${mmss(fonte.duracao)}`; };
    pos.onchange = () => { fonte.t = +pos.value; arrastandoPos = false; };
    $('#m-menos', el).onclick = () => { fonte.t = Math.max(0, fonte.t - 10); };
    $('#m-mais', el).onclick = () => { fonte.t = Math.min(fonte.duracao || 1e9, fonte.t + 10); };
    pausa.onclick = async () => {
      if (fonte.tocando) { fonte.pause(); return; }
      try { await fonte.play(); if (!comecou) inicioT = Math.round(fonte.t * 100) / 100; comecou = true; mostrar(); } catch { aviso('Toque de novo para a música continuar.'); }
    };
  }
  function sair(r) {
    saiu = true; cancelAnimationFrame(raf); if (fonte) fonte.destruir();
    document.removeEventListener('keydown', tecla); el.remove();
    const comBateria = marcas.length > antigas && r !== null;
    fim(r, fonte ? fonte.tipo : 'cronometro', comBateria ? marcas.sort((a, b) => a.t - b.t) : null, r && solos.length ? solos : null);
  }
  async function bater() {
    if (tempos.length >= linhas.length) return sair(tempos);
    if (!comecou) {
      if (fonte) {
        try { await fonte.play(); } catch { aviso('Toque de novo para a música começar.'); return; }
        if (fonte.tipo === 'youtube') setTimeout(() => { if (!saiu && !fonte.tocando) aviso('Se o vídeo não começou, toque nele uma vez.', 6000); }, 1500);
      } else t0 = agora();
      comecou = true; inicioT = Math.round(t() * 100) / 100; mostrar(); return;
    }
    tempos.push(Math.max(0, Math.round((t() - 0.12) * 100) / 100)); // desconta o tempo de reação
    const fechou = solo; // o toque que volta a cantar fecha o solo: ele dura do botão Solo até aqui
    if (solo) { solos.push({ t: Math.round(solo.t * 100) / 100, k: tempos.length - 1, fim: tempos[tempos.length - 1] }); solo = null; }
    hist.push({ a: 'l', solo: fechou });
    const n = tempos.length;
    ultimo = `Linha ${n} marcada em ${dec(tempos[n - 1])}${n > 1 ? ` (a anterior durou ${seg(tempos[n - 1] - tempos[n - 2])})` : ''}.`;
    sel = -1; edicao.hidden = true; piscar = n - 1;
    if (tempos.length >= linhas.length && fonte) fonte.pause();
    mostrar();
  }
  el.querySelectorAll('#m-tipos [data-t]').forEach(b => b.onclick = () => {
    if (!comecou) { aviso('Toque na música primeiro (botão grande).'); return; }
    marcas.push({ t: Math.max(0, Math.round((t() - 0.15) * 100) / 100), tipo: b.dataset.t }); // desconta o tempo do dedo
    hist.push({ a: 'm' }); mostrar();
    b.classList.remove('pisca'); void b.offsetWidth; b.classList.add('pisca');
  });
  function tecla(ev) { if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); bater(); } }
  toque.onclick = bater;
  $('#m-solo', el).onclick = () => {
    if (!comecou) { aviso('Toque na música primeiro (botão grande).'); return; }
    if (solo) { solo = null; const i = hist.map(h => h.a).lastIndexOf('s'); if (i >= 0) hist.splice(i, 1); }
    else { solo = { t: t() }; hist.push({ a: 's' }); }
    mostrar();
  };
  $('#m-desfazer', el).onclick = () => {
    const h = hist.pop(); if (!h) return;
    if (h.a === 'm') marcas.pop();
    else if (h.a === 's') solo = null;
    else { tempos.pop(); if (h.solo) { solos.pop(); solo = h.solo; hist.push({ a: 's' }); } } // desfez o toque que fechou o solo: o solo volta a esperar
    sel = -1; edicao.hidden = true; ultimo = h.a === 'l' ? 'Desfiz a última linha.' : '';
    mostrar();
  };
  $('#m-cancelar', el).onclick = () => sair(null);
  $('#m-ok', el).onclick = () => sair(tempos.length || marcas.length > antigas ? tempos : null);
  document.addEventListener('keydown', tecla);
  mostrar(); relogio(); toque.focus();
}

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
rota();
// traz do site o que foi feito em outro aparelho; só redesenha se estiver na tela inicial
// ao abrir o link sem ter entrado: pede a senha antes de tudo (é ela que traz as músicas e o mp3 do site)
function pedirSenha() {
  if (document.querySelector('.porta')) return;
  const el = document.createElement('div');
  el.className = 'porta';
  el.innerHTML = `
    <form class="porta-caixa">
      <div class="marca">${ICONE.marca}<span>Mapa de Bateria</span></div>
      <p>Entre com a senha do painel da Lhart para ver suas músicas e ouvir os mp3.</p>
      <label class="campo">Senha<input type="password" id="porta-senha" autocomplete="current-password" required></label>
      <button class="btn primario" type="submit">Entrar</button>
      <button class="btn" type="button" id="porta-pular">Usar sem entrar</button>
      <p class="dica" id="porta-erro" aria-live="polite"></p>
    </form>`;
  document.body.appendChild(el);
  const campo = $('#porta-senha', el), erro = $('#porta-erro', el);
  campo.focus();
  $('form', el).onsubmit = async ev => {
    ev.preventDefault();
    const botao = $('button[type=submit]', el);
    botao.disabled = true; botao.textContent = 'Entrando…'; erro.textContent = '';
    const msg = await Nuvem.entrar(campo.value);
    botao.disabled = false; botao.textContent = 'Entrar';
    if (msg) { erro.textContent = msg; campo.select(); return; }
    el.remove();
    aviso('Pronto. Suas músicas e os mp3 vêm do site.');
    rota(); // redesenha a tela já com o que está no site
  };
  $('#porta-pular', el).onclick = () => {
    try { sessionStorage.setItem('mapabateria.semSenha', '1'); } catch {}
    el.remove();
    aviso('Sem entrar, fica só o que está neste celular. Para entrar depois: tela inicial, Guardar no site.', 8000);
  };
}
Nuvem.pronto = Nuvem.carregar().then(() => {
  let pulou = false;
  try { pulou = sessionStorage.getItem('mapabateria.semSenha') === '1'; } catch {}
  if (Nuvem.estado === 'entrar' && !pulou) pedirSenha();
  const h = location.hash.slice(1) || '/';
  if (h === '/' || h === '') telaLista(); else mostrarNuvem();
});
// voltou para o app (saiu e entrou, ou trocou de aba): busca o que foi salvo em outro aparelho
let ultimaBusca = Date.now();
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState !== 'visible' || Date.now() - ultimaBusca < 20000) return;
  if (Nuvem.estado === 'desligada' || Nuvem.estado === 'entrar' || dados.pendente) return;
  if (edFonte || (P && P.tocando)) return; // não mexe no que está em uso
  ultimaBusca = Date.now();
  const antes = JSON.stringify([dados.locais, dados.listas, dados.ocultas]);
  await Nuvem.carregar();
  if (JSON.stringify([dados.locais, dados.listas, dados.ocultas]) === antes) return;
  const h = location.hash.slice(1) || '/';
  if (h === '/' || h.startsWith('/l/')) { rota(); aviso('Atualizado com o que foi salvo em outro aparelho.'); }
  else aviso('Chegou versão nova do site. Volte à lista e abra a música de novo para ver.', 7000);
});
})();
