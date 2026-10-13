// Telegram Bot API (só no servidor; o token nunca vai para o navegador).
const crypto = require('crypto');

const token = () => process.env.TELEGRAM_BOT_TOKEN || '';

// segredo que o Telegram devolve a cada aviso para provar que veio dele (derivado do token, sem variável extra)
const webhookSecret = () => crypto.createHash('sha256').update('lh-tg|' + token()).digest('hex').slice(0, 40);

async function tg(method, body) {
  if (!token()) return { ok: false, description: 'sem token' };
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 4000);
  try {
    const r = await fetch('https://api.telegram.org/bot' + token() + '/' + method, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}), signal: ctl.signal,
    });
    return await r.json();
  } catch (e) {
    return { ok: false, description: 'falha de rede' };
  } finally { clearTimeout(t); }
}

// quem recebe os avisos: o ID fixo da Vercel (se existir) ou o que foi ligado pelo painel
async function chatId(redis) {
  if (process.env.TELEGRAM_CHAT_ID) return process.env.TELEGRAM_CHAT_ID;
  try { return (await redis.get('telegram:chat')) || ''; } catch { return ''; }
}

module.exports = { token, webhookSecret, tg, chatId };
