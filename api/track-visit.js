const { getRedis } = require('./_lib/redis');
const { bodyOf, clean, validVid, geo, BOT, device } = require('./_lib/util');

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).end(); return; }
  const body = bodyOf(req);
  const ua = String(req.headers['user-agent'] || '');
  if (BOT.test(ua)) { res.status(204).end(); return; } // robôs e prévias não contam como visita
  const entry = {
    ts: Date.now(),
    path: clean(body.path, 200),
    ref: clean(body.ref, 300),
    lang: clean(body.lang, 10),
    vid: validVid(body.vid),
    sid: validVid(body.sid),
    us: clean(body.us, 60), // utm_source (ou o)
    um: clean(body.um, 60), // utm_medium
    uc: clean(body.uc, 80), // utm_campaign
    tz: clean(body.tz, 40),
    w: Math.max(0, Math.min(10000, parseInt(body.w, 10) || 0)),
    ...device(ua),
    ...geo(req),
    ua: ua.slice(0, 200),
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
