// Operação da Lhart (uma função só, por causa do limite de funções da Vercel):
//   GET  /api/ops?a=monitor   -> confere o app, o cardápio e o certificado e AVISA no Telegram/WhatsApp se algo caiu
//   POST /api/ops?a=aviso     -> a plataforma (servidor) manda um aviso para o celular do Lucas: { texto, urgente }
//   GET  /api/ops?a=ping      -> só confere a chave
// Protegida por OPS_KEY (variável da Vercel): header "x-ops-key". Chamada de 5 em 5 minutos pelo GitHub Actions.
const crypto = require('crypto');
const tls = require('tls');
const { getRedis } = require('./_lib/redis');
const { bodyOf, clean, limited } = require('./_lib/util');
const { token: tgToken, tg, chatId: tgChatId } = require('./_lib/telegram');

const APP = 'https://delivery.lhartdesign.com';
const CHECAGENS = [
  { nome: 'App (saúde)', url: APP + '/saude', ok: (r, t) => r.status === 200 && /"ok"\s*:\s*true/.test(t) },
  { nome: 'Cardápio de exemplo', url: APP + '/c/demo-brasa-ponto', ok: (r, t) => r.status === 200 && t.includes('Brasa') },
  { nome: 'Tela de login', url: APP + '/entrar', ok: (r) => r.status === 200 },
  { nome: 'Site da Lhart', url: 'https://www.lhartdesign.com/delivery.html', ok: (r) => r.status === 200 },
];
const FALHAS_PARA_AVISAR = 2;      // 2 checagens seguidas ruins (≈ 10 min) antes de acordar o Lucas
const REPETIR_AVISO_MIN = 60;      // enquanto estiver fora do ar, lembra de novo a cada 60 min
const CERT_DIAS = 14;

function chaveOk(req) {
  const esperado = String(process.env.OPS_KEY || '');
  const dado = String((req.headers && req.headers['x-ops-key']) || (req.query && req.query.key) || '');
  if (esperado.length < 16 || dado.length !== esperado.length) return false;
  return crypto.timingSafeEqual(Buffer.from(dado), Buffer.from(esperado));
}

async function buscar(c) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 9000);
  const ini = Date.now();
  try {
    const r = await fetch(c.url, { signal: ctl.signal, redirect: 'manual', headers: { 'user-agent': 'LhartMonitor/1.0' } });
    const txt = (await r.text()).slice(0, 200000);
    return { nome: c.nome, ok: !!c.ok(r, txt), status: r.status, ms: Date.now() - ini };
  } catch (e) {
    return { nome: c.nome, ok: false, status: 0, ms: Date.now() - ini, erro: e && e.name === 'AbortError' ? 'sem resposta em 9 s' : 'falha de conexão' };
  } finally { clearTimeout(t); }
}

function diasDoCertificado(host) {
  return new Promise((resolve) => {
    const s = tls.connect({ host, port: 443, servername: host, timeout: 8000 }, () => {
      const c = s.getPeerCertificate();
      s.end();
      resolve(c && c.valid_to ? Math.floor((new Date(c.valid_to).getTime() - Date.now()) / 86400000) : null);
    });
    s.on('error', () => resolve(null));
    s.on('timeout', () => { s.destroy(); resolve(null); });
  });
}

async function avisar(redis, texto, urgente) {
  const tarefas = [];
  if (tgToken()) {
    const dest = await tgChatId(redis);
    if (dest) tarefas.push(tg('sendMessage', { chat_id: dest, text: texto, disable_web_page_preview: true }));
  }
  const cmb = require('./_lib/callmebot');
  if (urgente && cmb.ligado()) {
    let pode = false;
    try { pode = !(await limited(redis, 'rl:wa:hora', 20, 3600)); } catch { pode = false; }
    if (pode) {
      const u = cmb.url(texto);
      const ctl = new AbortController();
      setTimeout(() => ctl.abort(), 4000);
      tarefas.push(fetch(u, { signal: ctl.signal }).catch(() => null));
    }
  }
  await Promise.allSettled(tarefas);
  return tarefas.length > 0;
}

const hora = () => new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

async function monitor(redis) {
  const [resultados, certDias] = await Promise.all([Promise.all(CHECAGENS.map(buscar)), diasDoCertificado('delivery.lhartdesign.com')]);
  const ruins = resultados.filter((r) => !r.ok);
  let est = {};
  try { const v = await redis.get('ops:mon'); est = (typeof v === 'string' ? JSON.parse(v) : v) || {}; } catch { est = {}; }
  const agora = Date.now();
  let acao = 'ok';

  if (ruins.length) {
    est.falhas = (est.falhas || 0) + 1;
    if (!est.desde) est.desde = agora;
    const devePedir = est.falhas >= FALHAS_PARA_AVISAR && (!est.aviso || agora - est.aviso > REPETIR_AVISO_MIN * 60000);
    if (devePedir) {
      const linhas = ruins.map((r) => '• ' + r.nome + ': ' + (r.erro || ('resposta ' + r.status)));
      const dura = Math.max(1, Math.round((agora - est.desde) / 60000));
      await avisar(redis, '🚨 Lhart: algo caiu (há ~' + dura + ' min, ' + hora() + ')\n' + linhas.join('\n') +
        '\nVeja o servidor no painel da RedHosting e o DNS de delivery.lhartdesign.com.', true);
      est.aviso = agora; acao = 'avisou';
    } else acao = 'falha-' + est.falhas;
  } else {
    if (est.aviso) {
      const dura = Math.max(1, Math.round((agora - (est.desde || agora)) / 60000));
      await avisar(redis, '✅ Lhart: voltou ao normal (' + hora() + '). Ficou fora cerca de ' + dura + ' min.', false);
      acao = 'recuperou';
    }
    est = { falhas: 0 };
  }
  try { await redis.set('ops:mon', JSON.stringify(est), { ex: 86400 * 7 }); } catch { /* o aviso já saiu */ }

  if (certDias != null && certDias <= CERT_DIAS) {
    let primeira = true;
    try { primeira = !!(await redis.set('ops:cert', '1', { ex: 86400, nx: true })); } catch { primeira = false; }
    if (primeira) await avisar(redis, '⚠️ Lhart: o certificado de delivery.lhartdesign.com vence em ' + certDias + ' dia(s). Confira a renovação automática no servidor.', false);
  }
  return { ok: !ruins.length, acao, certDias, checagens: resultados };
}

// ── Link curto (16/11/2026) ──────────────────────────────────────────────
// O Lucas: "os links ficaram gigantes, precisamos ter um encurtador". A proposta
// e a página do app levam tudo no ?d= (sem banco); aqui o código ganha um
// apelido de 7 letras: www.lhartdesign.com/p/abc1234 -> a página com o ?d=.
//   POST /api/ops?a=curto  { pagina: 'proposta'|'restaurante', d }  -> { url }
//   GET  /p/<id>  (vercel.json -> /api/ops?a=ir&id=<id>)             -> 302
// Sem chave: só encurta link das NOSSAS duas páginas, com um ?d= que abre
// (JSON com nome e validade) — quem forjar um, forja o link longo do mesmo
// jeito. Limite por IP. O apelido vive até 30 dias depois da validade.
const PAGINAS_CURTAS = { proposta: '/previa/proposta.html', restaurante: '/previa/restaurante.html', jogos: '/previa/loja-jogos.html' };
const SITE = 'https://www.lhartdesign.com';

function lerD(d) {
  if (!/^[A-Za-z0-9_-]{8,6000}$/.test(String(d || ''))) return null;
  try {
    const j = JSON.parse(Buffer.from(d, 'base64url').toString('utf8'));
    return j && typeof j === 'object' && typeof j.n === 'string' && j.n.trim()
      && /^\d{4}-\d{2}-\d{2}$/.test(String(j.a || '')) ? j : null;
  } catch { return null; }
}

function apelido(texto, tamanho) {
  const h = crypto.createHash('sha256').update(texto).digest();
  let n = BigInt('0x' + h.toString('hex').slice(0, 24));
  let s = '';
  const ab = 'abcdefghijkmnpqrstuvwxyz23456789';     // sem l, o, 0, 1 (não confundem)
  while (s.length < tamanho) { s += ab[Number(n % 32n)]; n /= 32n; }
  return s;
}

async function encurtar(req, res, redis) {
  const b = bodyOf(req);
  const pagina = String(b.pagina || '');
  const d = String(b.d || '');
  const j = lerD(d);
  if (!PAGINAS_CURTAS[pagina] || !j) { res.status(400).json({ error: 'link' }); return; }
  const { ipHash } = require('./_lib/util');
  if (await limited(redis, 'rl:curto:' + ipHash(req), 120, 3600)) { res.status(429).json({ error: 'limite' }); return; }
  const vence = Date.parse(j.a + 'T23:59:59Z');
  const ttl = Math.max(86400, Math.min(86400 * 120, Math.round((vence - Date.now()) / 1000) + 86400 * 30));
  const valor = pagina + '|' + d;
  for (const tam of [7, 10, 14]) {
    const id = apelido(valor, tam);
    const atual = await redis.get('curto:' + id);
    if (atual && atual !== valor) continue;           // colisão: apelido maior
    await redis.set('curto:' + id, valor, { ex: ttl });
    res.status(200).json({ ok: true, id, url: SITE + '/p/' + id });
    return;
  }
  res.status(500).json({ error: 'colisao' });
}

// ── Aviso no celular com respostas prontas (18/11/2026) ─────────────────────
// O Lucas: "avisar no meu WhatsApp quando alguém tiver interesse, se eu não vir,
// e me dar as opções de resposta já com a tradução, para ele enviar".
//   POST /api/ops?a=alerta    (OPS_KEY) { id, texto, opcoes: [str] } -> manda no
//        Telegram e no WhatsApp (CallMeBot), cada opção com um link de um toque.
//   GET  /r/<tok>/<n>         (público: o tok de 16 bytes é a chave) -> guarda a escolha.
//   POST /api/ops?a=escolhas  (OPS_KEY) -> o programa pega as escolhas e envia.
async function alerta(req, res, redis) {
  const b = bodyOf(req);
  const id = clean(b.id, 60).replace(/[^\w:-]/g, '');
  const texto = clean(b.texto, 1500).trim();
  const opcoes = (Array.isArray(b.opcoes) ? b.opcoes : []).slice(0, 3).map(function (o) { return clean(o, 900).trim(); }).filter(Boolean);
  if (!id || !texto) { res.status(400).json({ error: 'dados' }); return; }
  if (await limited(redis, 'rl:ops:alerta', 60, 3600)) { res.status(429).json({ error: 'limite' }); return; }
  const tok = crypto.randomBytes(12).toString('base64url');
  await redis.set('alerta:' + tok, JSON.stringify({ id: id, n: opcoes.length }), { ex: 86400 * 3 });
  var corpo = texto;
  opcoes.forEach(function (o, i) {
    corpo += '\n\n' + (i + 1) + ') ' + o + '\n👉 Enviar a ' + (i + 1) + ': ' + SITE + '/r/' + tok + '/' + (i + 1);
  });
  if (corpo.length > 3900) corpo = corpo.slice(0, 3890) + '…';
  const enviado = await avisar(redis, corpo, true);
  res.status(200).json({ ok: true, enviado: enviado, tok: tok });
}

function paginaEscolha(res, ok, titulo, texto) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(ok ? 200 : 410).end('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">' +
    '<title>' + titulo + '</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#161826;color:#f1f1f5;font:16px/1.5 system-ui,sans-serif;text-align:center;padding:24px">' +
    '<div><div style="font-size:64px">' + (ok ? '✅' : '⏳') + '</div><h1 style="font-size:22px;margin:10px 0">' + titulo + '</h1><p style="color:#a3a7ba;max-width:30ch;margin:0 auto">' + texto + '</p></div></body>');
}

async function escolher(req, res, redis) {
  const tok = String((req.query && req.query.t) || '').replace(/[^\w-]/g, '').slice(0, 32);
  const n = parseInt((req.query && req.query.n) || '0', 10);
  let dados = null;
  try { dados = tok ? JSON.parse(await redis.get('alerta:' + tok) || 'null') : null; } catch { dados = null; }
  if (dados && typeof dados === 'string') { try { dados = JSON.parse(dados); } catch { dados = null; } }
  if (!dados || !(n >= 1 && n <= dados.n)) { paginaEscolha(res, false, 'Este link não vale mais', 'Ele já foi usado ou venceu. Responda pela Caixa de entrada do programa.'); return; }
  // ⚠ O WhatsApp e o Telegram ABREM o link sozinhos para montar a prévia: um GET
  // não pode escolher nada. O GET mostra o botão; só o toque nele (POST) conta.
  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).end('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">' +
      '<title>Enviar a opção ' + n + '</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#161826;color:#f1f1f5;font:16px/1.5 system-ui,sans-serif;text-align:center;padding:24px">' +
      '<form method="post"><div style="font-size:56px">💬</div><h1 style="font-size:22px;margin:10px 0">Enviar a opção ' + n + ' ao cliente?</h1>' +
      '<p style="color:#a3a7ba;max-width:30ch;margin:0 auto 22px">O programa manda a resposta pelo WhatsApp ou Instagram dele e te confirma aqui.</p>' +
      '<button style="padding:16px 30px;border:0;border-radius:99px;background:#4be39a;color:#0d1a13;font:800 17px system-ui">Enviar esta resposta</button></form></body>');
    return;
  }
  // Um toque só: o link morre ao ser usado (não manda duas vezes a mesma resposta).
  const primeiro = await redis.set('alerta:usado:' + tok, '1', { ex: 86400 * 3, nx: true });
  if (!primeiro) { paginaEscolha(res, false, 'Você já escolheu', 'A resposta deste aviso já foi escolhida. O programa envia (ou já enviou) e te avisa aqui.'); return; }
  await redis.rpush('alerta:escolhas', JSON.stringify({ id: dados.id, n: n, em: Date.now() }));
  await redis.expire('alerta:escolhas', 86400 * 3);
  paginaEscolha(res, true, 'Opção ' + n + ' escolhida', 'O programa envia para o cliente em até 1 minuto (com ele aberto) e te confirma no celular.');
}

async function escolhas(req, res, redis) {
  const lista = (await redis.lrange('alerta:escolhas', 0, 49)) || [];
  if (lista.length) await redis.ltrim('alerta:escolhas', lista.length, -1);
  res.status(200).json({ ok: true, escolhas: lista.map(function (x) { return typeof x === 'string' ? JSON.parse(x) : x; }) });
}

// ── Caixa no celular (20/11/2026) ───────────────────────────────────────────
// O Lucas quer mandar a resposta pronta (ou gerar a do app e enviar) pelo celular,
// com o PC ligado. O programa (SniperLeads, caixa_remota.py) traz a lista de quem
// espera a cada ~1 min e busca o que ele tocou a cada 20 s; o envio sai do PC.
//   GET  /caixa?k=<chave>              -> a página (k = HMAC da OPS_KEY; não fica guardada)
//   GET  /api/ops?a=caixa_dados&k=     -> lista + resultados + quando o PC falou por último
//   POST /api/ops?a=caixa_cmd&k=       -> { acao, phone, texto, tipo, rascunho_id } entra na fila
//   POST /api/ops?a=caixa_sync (OPS_KEY) -> o PC entrega lista/resultados e leva a fila
const CAIXA_HTML = require('./_lib/caixa_html');
const CAIXA_ACOES = ['enviar', 'material', 'escrever', 'rascunhar', 'descartar',
  // 21/11/2026: e-mail, recusou (motivo), buscar clientes, criar página, piloto e atendente
  'email', 'recusar', 'buscar', 'pagina', 'piloto', 'atendente', 'controle', 'procurar', 'proposta', 'busca_livre'];

function chaveCaixa() {
  const k = String(process.env.OPS_KEY || '');
  if (k.length < 16) return '';
  return crypto.createHmac('sha256', k).update('caixa-celular').digest('base64url').slice(0, 32);
}

function caixaOk(req) {
  const esperado = chaveCaixa();
  const dado = String((req.query && req.query.k) || (req.headers && req.headers['x-caixa']) || '');
  if (!esperado || dado.length !== esperado.length) return false;
  return crypto.timingSafeEqual(Buffer.from(dado), Buffer.from(esperado));
}

function lido(v) {
  if (v == null) return null;
  if (typeof v === 'string') { try { return JSON.parse(v); } catch { return v; } }
  return v;
}

async function caixaSync(req, res, redis) {
  const b = bodyOf(req);
  const tarefas = [redis.set('caixa:vivo', String(Date.now()), { ex: 86400 * 3 })];
  if (Array.isArray(b.itens)) {
    const v = JSON.stringify({ itens: b.itens.slice(0, 40), em: Date.now(), estado: b.estado || {} });
    if (v.length < 900000) tarefas.push(redis.set('caixa:itens', v, { ex: 86400 * 2 }));
  }
  if (b.resultados && typeof b.resultados === 'object') {
    const v = JSON.stringify(b.resultados);
    if (v.length < 200000) tarefas.push(redis.set('caixa:res', v, { ex: 86400 * 2 }));
  }
  await Promise.all(tarefas);
  const lista = (await redis.lrange('caixa:cmds', 0, 19)) || [];
  if (lista.length) await redis.ltrim('caixa:cmds', lista.length, -1);
  res.status(200).json({ ok: true, cmds: lista.map(lido).filter(Boolean) });
}

async function caixaDados(req, res, redis) {
  const [itens, resultados, vivo, fila] = await Promise.all([
    redis.get('caixa:itens'), redis.get('caixa:res'), redis.get('caixa:vivo'), redis.llen('caixa:cmds')]);
  res.status(200).json({ ok: true, dados: lido(itens) || { itens: [] }, resultados: lido(resultados) || {},
    vivo: parseInt(vivo || '0', 10) || 0, agora: Date.now(), na_fila: fila || 0 });
}

async function caixaCmd(req, res, redis) {
  const b = bodyOf(req);
  const acao = clean(b.acao, 20);
  if (CAIXA_ACOES.indexOf(acao) < 0) { res.status(400).json({ error: 'acao' }); return; }
  if (await limited(redis, 'rl:ops:caixa_cmd', 120, 3600)) { res.status(429).json({ error: 'limite' }); return; }
  const cmd = {
    id: crypto.randomBytes(8).toString('base64url'), acao: acao,
    phone: clean(b.phone, 40), texto: clean(b.texto, 2000).trim(), tipo: clean(b.tipo, 30),
    para: clean(b.para, 120).trim(), nome: clean(b.nome, 60).trim(), idioma: clean(b.idioma, 5),
    rascunho_id: parseInt(b.rascunho_id || '0', 10) || null, em: Date.now(),
  };
  await redis.rpush('caixa:cmds', JSON.stringify(cmd));
  await redis.expire('caixa:cmds', 86400);
  res.status(200).json({ ok: true, id: cmd.id });
}

function caixaPagina(res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.status(200).end(CAIXA_HTML);
}

// ── Quem abriu a proposta (26/11/2026) ─────────────────────────────────────
// O Lucas: "pode fazer tudo" — o aviso "o JW Marriott abriu a proposta 3 vezes
// hoje, hora de ligar". O /p/<id> já passa por aqui; cada abertura de GENTE vira
// uma linha na lista 'aberturas' (últimas 500), que o programa lê com a chave.
// O WhatsApp, o Instagram e o Facebook abrem o link sozinhos para montar a
// prévia — esses ficam de fora pelo user-agent, senão todo envio seria "abriu".
const UA_ROBO = /bot|crawler|spider|preview|whatsapp|facebookexternalhit|facebot|telegram|slack|discord|twitter|skype|linkedinbot|embedly|curl|python|wget|headless|vercel/i;

async function anotarAbertura(redis, req, id, pagina, d) {
  const ua = String((req.headers && req.headers['user-agent']) || '');
  if (!ua || UA_ROBO.test(ua)) return;
  const j = lerD(d);
  const item = JSON.stringify({ id, p: pagina, n: j ? String(j.n).slice(0, 80) : '', t: Date.now() });
  await redis.lpush('aberturas', item);
  await redis.ltrim('aberturas', 0, 499);
}

async function aberturas(req, res, redis) {
  const desde = Number((req.query && req.query.desde) || 0) || 0;
  const brutos = (await redis.lrange('aberturas', 0, 499)) || [];
  const lista = [];
  for (const b of brutos) {
    let x = b;
    if (typeof x === 'string') { try { x = JSON.parse(x); } catch { continue; } }
    if (x && Number(x.t) > desde) lista.push(x);
  }
  res.status(200).json({ ok: true, aberturas: lista });
}

async function ir(req, res, redis) {
  const id = String((req.query && req.query.id) || '');
  let valor = null;
  if (/^[a-z0-9]{7,14}$/.test(id)) {
    try { valor = await redis.get('curto:' + id); } catch { valor = null; }
  }
  const [pagina, d] = String(valor || '').split('|');
  if (PAGINAS_CURTAS[pagina] && d) {
    try { await anotarAbertura(redis, req, id, pagina, d); } catch { /* o redirect vem antes de tudo */ }
  }
  const destino = PAGINAS_CURTAS[pagina] && d ? PAGINAS_CURTAS[pagina] + '?d=' + d : '/social.html';
  res.setHeader('Location', destino);
  res.status(302).end();
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const acao = (req.query && req.query.a) || '';
  if (acao === 'escolher') {
    let r;
    try { r = getRedis(); } catch { paginaEscolha(res, false, 'Fora do ar', 'Tente de novo em instantes.'); return; }
    try { await escolher(req, res, r); } catch (e) { paginaEscolha(res, false, 'Não deu certo', 'Tente de novo em instantes.'); }
    return;
  }
  if (acao === 'ir' || (acao === 'curto' && req.method === 'POST')) {
    let r;
    try { r = getRedis(); } catch {
      if (acao === 'ir') { res.setHeader('Location', '/social.html'); res.status(302).end(); return; }
      res.status(503).json({ error: 'indisponivel' }); return;
    }
    try { await (acao === 'ir' ? ir(req, res, r) : encurtar(req, res, r)); }
    catch (e) { res.status(500).json({ error: String((e && e.message) || e) }); }
    return;
  }
  if (acao === 'caixa' || acao === 'caixa_dados' || acao === 'caixa_cmd') {
    if (!caixaOk(req)) { paginaEscolha(res, false, 'Link sem permissão', 'Abra pelo link que o programa mandou no seu WhatsApp/Telegram.'); return; }
    if (acao === 'caixa') { caixaPagina(res); return; }
    let r;
    try { r = getRedis(); } catch { res.status(503).json({ error: 'indisponivel' }); return; }
    try {
      if (acao === 'caixa_dados') { await caixaDados(req, res, r); return; }
      if (req.method !== 'POST') { res.status(405).json({ error: 'metodo' }); return; }
      await caixaCmd(req, res, r);
    } catch (e) { res.status(500).json({ error: String((e && e.message) || e) }); }
    return;
  }
  if (!chaveOk(req)) { res.status(404).end(); return; }
  const a = (req.query && req.query.a) || '';
  let redis;
  try { redis = getRedis(); } catch { res.status(503).json({ error: 'indisponivel' }); return; }
  try {
    if (a === 'ping') { res.status(200).json({ ok: true }); return; }
    if (a === 'monitor' && (req.method === 'GET' || req.method === 'POST')) { res.status(200).json(await monitor(redis)); return; }
    if (a === 'aviso' && req.method === 'POST') {
      const b = bodyOf(req);
      const texto = clean(b.texto, 600).trim();
      if (!texto) { res.status(400).json({ error: 'texto' }); return; }
      if (await limited(redis, 'rl:ops:aviso', 40, 3600)) { res.status(429).json({ error: 'limite' }); return; }
      const enviado = await avisar(redis, '📣 ' + texto, !!b.urgente);
      res.status(200).json({ ok: true, enviado });
      return;
    }
    if (a === 'alerta' && req.method === 'POST') { await alerta(req, res, redis); return; }
    if (a === 'escolhas' && req.method === 'POST') { await escolhas(req, res, redis); return; }
    if (a === 'caixa_sync' && req.method === 'POST') { await caixaSync(req, res, redis); return; }
    if (a === 'aberturas' && req.method === 'GET') { await aberturas(req, res, redis); return; }
    res.status(400).json({ error: 'acao' });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
