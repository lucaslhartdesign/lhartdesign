// Recebe do Telegram o toque em "Iniciar" do seu bot e guarda quem você é (sem precisar saber o ID).
//   O painel gera um código de 10 minutos e abre t.me/SEU_BOT?start=CODIGO; o bot recebe "/start CODIGO".
const crypto = require('crypto');
const { getRedis } = require('./_lib/redis');
const { bodyOf } = require('./_lib/util');
const { token, webhookSecret, tg } = require('./_lib/telegram');

module.exports = async (req, res) => {
  if (req.method !== 'POST' || !token()) { res.status(404).end(); return; }
  const dado = String(req.headers['x-telegram-bot-api-secret-token'] || '');
  const esperado = webhookSecret();
  const ok = dado.length === esperado.length && crypto.timingSafeEqual(Buffer.from(dado), Buffer.from(esperado));
  if (!ok) { res.status(403).end(); return; }
  const upd = bodyOf(req);
  const msg = upd && upd.message;
  if (!msg || !msg.chat || msg.chat.type !== 'private') { res.status(200).json({ ok: true }); return; }
  const texto = String(msg.text || '').trim();
  try {
    const redis = getRedis();
    const m = /^(?:\/start(?:@\w+)?\s+)?([A-Za-z0-9]{6,32})$/.exec(texto);
    if (m) {
      const certo = await redis.get('telegram:code');
      if (certo && String(certo) === m[1]) {
        await redis.set('telegram:chat', String(msg.chat.id));
        await redis.del('telegram:code');
        await tg('sendMessage', { chat_id: msg.chat.id, text: '✅ Pronto! Vou te avisar aqui sempre que alguém escrever no site da Lhart Design. Para responder, abra o painel: https://www.lhartdesign.com/admin.html' });
      } else if (/^\/start/.test(texto)) {
        await tg('sendMessage', { chat_id: msg.chat.id, text: 'Esse código não vale mais. Abra o painel (Acesso → Conversas) e toque em "Ligar Telegram" de novo.' });
      } else {
        await tg('sendMessage', { chat_id: msg.chat.id, text: 'Este bot só envia os avisos do site da Lhart Design. Para ligar, use o botão "Ligar Telegram" no painel (Acesso → Conversas).' });
      }
    } else {
      await tg('sendMessage', { chat_id: msg.chat.id, text: 'Este bot só envia os avisos do site da Lhart Design. Para ligar, use o botão "Ligar Telegram" no painel (Acesso → Conversas).' });
    }
  } catch (e) { /* o Telegram só precisa de um 200; tentar de novo não ajuda */ }
  res.status(200).json({ ok: true });
};
