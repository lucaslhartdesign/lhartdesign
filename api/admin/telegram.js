// Painel: liga, testa e desliga os avisos no Telegram (e mostra o estado dos avisos no WhatsApp).
//   GET  /api/admin/telegram                 -> { token, ligado, bot, whatsapp }
//   POST /api/admin/telegram {a:'ligar'}     -> prepara o bot e devolve o link com o código
//   POST /api/admin/telegram {a:'testar'}    -> manda uma mensagem de teste
//   POST /api/admin/telegram {a:'desligar'}  -> esquece o Telegram
const crypto = require('crypto');
const { getRedis } = require('../_lib/redis');
const { requireAuth } = require('../_lib/auth');
const { bodyOf } = require('../_lib/util');
const { token, webhookSecret, tg, chatId } = require('../_lib/telegram');

module.exports = async (req, res) => {
  if (!(await requireAuth(req, res))) return;
  res.setHeader('Cache-Control', 'no-store');
  const whatsapp = !!(process.env.CALLMEBOT_PHONE && process.env.CALLMEBOT_KEY);
  let redis;
  try { redis = getRedis(); } catch { res.status(503).json({ error: 'indisponivel' }); return; }
  try {
    if (req.method === 'GET') {
      if (!token()) { res.status(200).json({ token: false, ligado: false, whatsapp }); return; }
      const [me, chat, wh] = await Promise.all([tg('getMe'), chatId(redis), tg('getWebhookInfo')]);
      const w = wh && wh.ok ? wh.result : {};
      res.status(200).json({
        token: true, ligado: !!chat, bot: me && me.ok ? me.result.username : '', erro: me && me.ok ? '' : (me && me.description) || 'token recusado', whatsapp,
        webhook: { url: w.url || '', erro: w.last_error_message || '', quando: w.last_error_date ? w.last_error_date * 1000 : 0, pendentes: w.pending_update_count || 0 },
      });
      return;
    }
    if (req.method !== 'POST') { res.status(405).json({ error: 'metodo' }); return; }
    if (!token()) { res.status(400).json({ error: 'Falta o TELEGRAM_BOT_TOKEN na Vercel.' }); return; }
    const a = bodyOf(req).a;
    if (a === 'ligar') {
      const me = await tg('getMe');
      if (!me.ok) { res.status(400).json({ error: 'O Telegram recusou o token: ' + (me.description || 'confira o TELEGRAM_BOT_TOKEN') }); return; }
      const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
      const w = await tg('setWebhook', { url: 'https://' + host + '/api/telegram', secret_token: webhookSecret(), allowed_updates: ['message'], drop_pending_updates: true });
      if (!w.ok) { res.status(400).json({ error: 'Não consegui ligar o bot: ' + (w.description || 'erro') }); return; }
      const code = crypto.randomBytes(8).toString('hex');
      await redis.set('telegram:code', code, { ex: 600 });
      res.status(200).json({ ok: true, bot: me.result.username, code, link: 'https://t.me/' + me.result.username + '?start=' + code });
      return;
    }
    if (a === 'testar') {
      const chat = await chatId(redis);
      if (!chat) { res.status(400).json({ error: 'O Telegram ainda não está ligado.' }); return; }
      const r = await tg('sendMessage', { chat_id: chat, text: '🔔 Teste: os avisos do site da Lhart Design estão chegando aqui.' });
      res.status(r.ok ? 200 : 400).json(r.ok ? { ok: true } : { error: 'O Telegram recusou: ' + (r.description || 'erro') });
      return;
    }
    if (a === 'desligar') {
      await redis.del('telegram:chat');
      res.status(200).json({ ok: true });
      return;
    }
    res.status(400).json({ error: 'acao' });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
