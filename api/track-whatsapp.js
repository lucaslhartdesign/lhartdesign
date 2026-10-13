const { getRedis } = require('./_lib/redis');
const { bodyOf, clean, validVid, geo, BOT } = require('./_lib/util');

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).end(); return; }
  const body = bodyOf(req);
  if (BOT.test(String(req.headers['user-agent'] || ''))) { res.status(204).end(); return; }
  const entry = {
    ts: Date.now(),
    source: clean(body.source, 100),
    path: clean(body.path, 200),
    lang: clean(body.lang, 10),
    vid: validVid(body.vid),
    ...geo(req),
  };
  try {
    const redis = getRedis();
    await redis.lpush('whatsapp', JSON.stringify(entry));
    await redis.ltrim('whatsapp', 0, 4999);
  } catch (e) {
    // Don't block the visitor if tracking storage is unavailable.
  }
  res.status(204).end();
};
