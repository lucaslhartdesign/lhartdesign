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
    // mp3 do Lucas guardado em pedaços (o Redis aceita pouco por vez); só sai com login
    if (req.query && req.query.k === 'audio') {
      const id = String(req.query.id || ''), i = Number(req.query.i);
      if (!/^[\w-]{1,80}$/.test(id) || !Number.isInteger(i) || i < 0 || i > 200) { res.status(400).json({ error: 'bad request' }); return; }
      const [meta, pedaco] = await Promise.all([redis.get(`bateria:audio:${id}:meta`), redis.get(`bateria:audio:${id}:${i}`)]);
      const m = parse(meta), p = parse(pedaco);
      if (!m || !p) { res.status(404).json({ error: 'not found' }); return; }
      res.setHeader('Cache-Control', 'private, no-store');
      res.status(200).json({ total: m.total, tipo: m.tipo, d: p.d });
      return;
    }
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
