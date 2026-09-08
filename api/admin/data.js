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
    const [testimonials, plans, videos, visitsRaw, waRaw, visitsTotal, waTotal] = await Promise.all([
      redis.get('content:testimonials'),
      redis.get('content:plans'),
      redis.get('content:videos'),
      redis.lrange('visits', 0, 199),
      redis.lrange('whatsapp', 0, 199),
      redis.llen('visits'),
      redis.llen('whatsapp'),
    ]);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      testimonials: parse(testimonials),
      plans: parse(plans),
      videos: parse(videos),
      visits: (visitsRaw || []).map(parse).filter(Boolean),
      visitsTotal: visitsTotal || 0,
      whatsapp: (waRaw || []).map(parse).filter(Boolean),
      whatsappTotal: waTotal || 0,
    });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
