// Utilidades compartilhadas pelas funções de visitas e de chat.
const crypto = require('crypto');

function bodyOf(req) {
  let body = req.body;
  if (!body || typeof body === 'string') {
    try { body = JSON.parse(body || '{}'); } catch { body = {}; }
  }
  return body && typeof body === 'object' ? body : {};
}

const clean = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').slice(0, n);

// id anônimo do visitante, gerado no navegador dele
const validVid = (v) => (typeof v === 'string' && /^[a-z0-9]{8,32}$/.test(v)) ? v : '';

// o upstash às vezes devolve o JSON já interpretado, às vezes como texto
function parse(v) {
  if (v == null) return null;
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch { return null; }
}

function geo(req) {
  const h = req.headers || {};
  let city = '';
  try { city = h['x-vercel-ip-city'] ? decodeURIComponent(h['x-vercel-ip-city']) : ''; } catch { city = String(h['x-vercel-ip-city'] || ''); }
  return { country: h['x-vercel-ip-country'] || 'unknown', region: h['x-vercel-ip-country-region'] || '', city };
}

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|lighthouse|pingdom|uptime|headless|vercel-screenshot|python-requests|curl\//i;

function device(uaRaw) {
  const ua = String(uaRaw || '');
  const tipo = /iPad|Tablet|PlayBook/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) ? 'tablet'
    : /Mobi|iPhone|Android/i.test(ua) ? 'celular' : 'computador';
  const nav = /Edg\//.test(ua) ? 'Edge' : /OPR\/|Opera/.test(ua) ? 'Opera' : /SamsungBrowser/.test(ua) ? 'Samsung'
    : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Outro';
  return { dev: tipo, nav };
}

// limite simples por chave (Redis): devolve true quando passou do máximo
async function limited(redis, key, max, seconds) {
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, seconds);
  return n > max;
}

function ipHash(req) {
  const ip = String((req.headers && (req.headers['x-forwarded-for'] || req.headers['x-real-ip'])) || '').split(',')[0].trim();
  return crypto.createHash('sha256').update('lh|' + ip).digest('hex').slice(0, 16);
}

module.exports = { bodyOf, clean, validVid, parse, geo, BOT, device, limited, ipHash };
