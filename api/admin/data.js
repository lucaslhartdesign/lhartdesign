const { getRedis } = require('../_lib/redis');
const { requireAuth } = require('../_lib/auth');

function parse(v) {
  if (v == null) return null;
  return typeof v === 'string' ? JSON.parse(v) : v;
}

module.exports = async (req, res) => {
  if (!(await requireAuth(req, res))) return;
  try {
    const redis = getRedis();
    // Mapa de Bateria (/bateria/): músicas e listas de ensaio do Lucas. Mora aqui por causa do limite de funções da Vercel.
    if (req.query && req.query.k === 'bateria') {
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json({ bateria: parse(await redis.get('bateria:dados')) });
      return;
    }
    const [testimonials, plans, videos, results, visitsRaw, waRaw, visitsTotal, waTotal] = await Promise.all([
      redis.get('content:testimonials'),
      redis.get('content:plans'),
      redis.get('content:videos'),
      redis.get('content:results'),
      redis.lrange('visits', 0, 1499),
      redis.lrange('whatsapp', 0, 499),
      redis.llen('visits'),
      redis.llen('whatsapp'),
    ]);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      testimonials: parse(testimonials),
      plans: parse(plans),
      videos: parse(videos),
      results: parse(results),
      visits: (visitsRaw || []).map(parse).filter(Boolean),
      visitsTotal: visitsTotal || 0,
      whatsapp: (waRaw || []).map(parse).filter(Boolean),
      whatsappTotal: waTotal || 0,
    });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
