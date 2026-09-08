const { getRedis } = require('./_lib/redis');

function parse(v) {
  if (v == null) return null;
  return typeof v === 'string' ? JSON.parse(v) : v;
}

module.exports = async (req, res) => {
  try {
    const redis = getRedis();
    const [testimonials, plans, videos] = await Promise.all([
      redis.get('content:testimonials'),
      redis.get('content:plans'),
      redis.get('content:videos'),
    ]);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ testimonials: parse(testimonials), plans: parse(plans), videos: parse(videos) });
  } catch (e) {
    // Redis not configured yet or unreachable — the site should keep working with its built-in defaults.
    res.status(200).json({ testimonials: null, plans: null, videos: null });
  }
};
