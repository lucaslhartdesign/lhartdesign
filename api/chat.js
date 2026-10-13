// Chat ao vivo do site (lado do visitante).
//   POST /api/chat?a=send   { vid, name, contact, text, page, hp }  -> grava a mensagem e avisa o Lucas
//   GET  /api/chat?a=poll&vid=...&after=<ts>                         -> mensagens novas e se ele está online
const { getRedis } = require('./_lib/redis');
const { bodyOf, clean, validVid, parse, geo, BOT, device, limited, ipHash } = require('./_lib/util');
const { token: tgToken, tg, chatId: tgChatId } = require('./_lib/telegram');

// Avisos para o Lucas. Cada um só liga se as variáveis do ambiente (Vercel) existirem:
//   Discord:  LH_DISCORD_WEBHOOK
//   Telegram: TELEGRAM_BOT_TOKEN (e liga o destino pelo painel: Acesso → Conversas → Ligar Telegram)
//   WhatsApp (CallMeBot, grátis): CALLMEBOT_PHONE (ex.: 5511999999999) + CALLMEBOT_KEY
// O WhatsApp avisa no máximo 1 vez a cada 5 min por conversa e 20 por hora no total, para não encher o celular.
async function chamar(url, opts) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 3000);
  try { return await fetch(url, { ...(opts || {}), signal: ctl.signal }); } catch { return null; } finally { clearTimeout(t); }
}

async function avisa(redis, meta, text) {
  const quem = meta.name || 'Visitante';
  const onde = [meta.city, meta.country && meta.country !== 'unknown' ? meta.country : ''].filter(Boolean).join(', ');
  const link = 'https://www.lhartdesign.com/admin.html';
  const tarefas = [];

  if (process.env.LH_DISCORD_WEBHOOK) {
    const corpo = {
      username: 'Site Lhart',
      content: '💬 **' + quem + '**' + (onde ? ' (' + onde + ')' : '') + (meta.contact ? ' · ' + meta.contact : '') + '\n> ' + text.replace(/\n/g, '\n> ').slice(0, 900) + '\nResponder: ' + link,
      allowed_mentions: { parse: [] },
    };
    tarefas.push(chamar(process.env.LH_DISCORD_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) }));
  }

  const resumo = '💬 Site Lhart: ' + quem + (onde ? ' (' + onde + ')' : '') + (meta.contact ? ' · ' + meta.contact : '') + '\n' + text.slice(0, 500) + '\nResponder: ' + link;

  if (tgToken()) {
    const dest = await tgChatId(redis);
    if (dest) tarefas.push(tg('sendMessage', { chat_id: dest, text: resumo, disable_web_page_preview: true }));
  }

  if (process.env.CALLMEBOT_PHONE && process.env.CALLMEBOT_KEY) {
    let pode = false;
    try {
      const primeira = await redis.set('chat:wa:' + meta.vid, '1', { ex: 300, nx: true });
      pode = !!primeira && !(await limited(redis, 'rl:wa:hora', 20, 3600));
    } catch { pode = false; }
    if (pode) {
      const u = 'https://api.callmebot.com/whatsapp.php?phone=' + encodeURIComponent(String(process.env.CALLMEBOT_PHONE).replace(/\D/g, '')) +
        '&text=' + encodeURIComponent(resumo) + '&apikey=' + encodeURIComponent(process.env.CALLMEBOT_KEY);
      tarefas.push(chamar(u));
    }
  }
  await Promise.allSettled(tarefas); // um aviso que falha não derruba os outros nem a mensagem do visitante
}

module.exports = async (req, res) => {
  const a = (req.query && req.query.a) || '';
  res.setHeader('Cache-Control', 'no-store');
  let redis;
  try { redis = getRedis(); } catch { res.status(503).json({ error: 'indisponivel' }); return; }

  if (req.method === 'GET' && a === 'poll') {
    const vid = validVid(req.query.vid);
    if (!vid) { res.status(400).json({ error: 'vid' }); return; }
    const after = parseInt(req.query.after, 10) || 0;
    const [raw, online] = await Promise.all([redis.lrange('chat:m:' + vid, -100, -1), redis.get('chat:online')]);
    const msgs = (raw || []).map(parse).filter((m) => m && m.t > after);
    res.status(200).json({ msgs, online: !!online });
    return;
  }

  if (req.method === 'POST' && a === 'send') {
    const body = bodyOf(req);
    const ua = String(req.headers['user-agent'] || '');
    if (BOT.test(ua) || body.hp) { res.status(200).json({ ok: true }); return; } // armadilha para robôs: finge que deu certo
    const vid = validVid(body.vid);
    const text = clean(body.text, 1000).trim();
    if (!vid || !text) { res.status(400).json({ error: 'dados' }); return; }
    const prev = parse(await redis.get('chat:meta:' + vid));
    const name = clean(body.name, 60).trim() || (prev && prev.name) || '';
    if (!name) { res.status(400).json({ error: 'nome' }); return; }
    if (await limited(redis, 'rl:chat:v:' + vid, 8, 600) || await limited(redis, 'rl:chat:ip:' + ipHash(req), 30, 3600)) {
      res.status(429).json({ error: 'muitas mensagens, tente de novo em alguns minutos' });
      return;
    }
    const now = Date.now();
    const g = geo(req);
    const meta = {
      vid, name,
      contact: clean(body.contact, 80).trim() || (prev && prev.contact) || '',
      page: clean(body.page, 200),
      country: g.country, city: g.city, ...device(ua),
      first: (prev && prev.first) || now, last: now, lastText: text.slice(0, 120), lastFrom: 'v',
      unread: ((prev && prev.unread) || 0) + 1,
    };
    const msg = { t: now, f: 'v', x: text };
    await redis.rpush('chat:m:' + vid, JSON.stringify(msg));
    await redis.ltrim('chat:m:' + vid, -300, -1);
    await redis.set('chat:meta:' + vid, JSON.stringify(meta));
    await redis.zadd('chat:idx', { score: now, member: vid });
    await avisa(redis, meta, text);
    res.status(200).json({ ok: true, t: now });
    return;
  }

  res.status(405).json({ error: 'metodo' });
};
