const { getRedis } = require('../_lib/redis');
const { requireAuth } = require('../_lib/auth');

function cleanTestimonials(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, 40).map((t) => ({
    stars: Math.max(1, Math.min(5, Number(t.stars) || 5)),
    quote: String(t.quote || '').slice(0, 600),
    name: String(t.name || '').slice(0, 100),
    location: String(t.location || '').slice(0, 100),
  }));
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }
  if (!(await requireAuth(req, res))) return;
  let body = req.body;
  if (!body || typeof body === 'string') {
    try { body = JSON.parse(body || '{}'); } catch { body = {}; }
  }
  const { key, data } = body || {};
  const redis = getRedis();

  if (key === 'testimonials') {
    const clean = cleanTestimonials(data);
    await redis.set('content:testimonials', JSON.stringify(clean));
    res.status(200).json({ ok: true, data: clean });
    return;
  }
  if (key === 'plans') {
    if (!data || typeof data !== 'object') { res.status(400).json({ error: 'invalid plans payload' }); return; }
    await redis.set('content:plans', JSON.stringify(data));
    res.status(200).json({ ok: true });
    return;
  }
  if (key === 'videos') {
    if (!data || typeof data !== 'object') { res.status(400).json({ error: 'invalid videos payload' }); return; }
    await redis.set('content:videos', JSON.stringify(data));
    res.status(200).json({ ok: true });
    return;
  }
  res.status(400).json({ error: 'unknown key: ' + key });
};
