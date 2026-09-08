const { getRedis } = require('./_lib/redis');

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).end(); return; }
  let body = req.body;
  if (!body || typeof body === 'string') {
    try { body = JSON.parse(body || '{}'); } catch { body = {}; }
  }
  const entry = {
    ts: Date.now(),
    path: String((body && body.path) || '').slice(0, 200),
    ref: String((body && body.ref) || '').slice(0, 300),
    lang: String((body && body.lang) || '').slice(0, 10),
    country: req.headers['x-vercel-ip-country'] || 'unknown',
    region: req.headers['x-vercel-ip-country-region'] || '',
    city: req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : '',
    ua: String(req.headers['user-agent'] || '').slice(0, 200),
  };
  try {
    const redis = getRedis();
    await redis.lpush('visits', JSON.stringify(entry));
    await redis.ltrim('visits', 0, 4999);
  } catch (e) {
    // Don't block the visitor if tracking storage is unavailable.
  }
  res.status(204).end();
};
