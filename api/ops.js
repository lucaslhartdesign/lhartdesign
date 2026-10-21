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
  if (urgente && process.env.CALLMEBOT_PHONE && process.env.CALLMEBOT_KEY) {
    let pode = false;
    try { pode = !(await limited(redis, 'rl:wa:hora', 20, 3600)); } catch { pode = false; }
    if (pode) {
      const u = 'https://api.callmebot.com/whatsapp.php?phone=' + encodeURIComponent(String(process.env.CALLMEBOT_PHONE).replace(/\D/g, '')) +
        '&text=' + encodeURIComponent(texto) + '&apikey=' + encodeURIComponent(process.env.CALLMEBOT_KEY);
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

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
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
    res.status(400).json({ error: 'acao' });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
