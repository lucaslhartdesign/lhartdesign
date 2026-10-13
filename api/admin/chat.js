// Chat ao vivo do site (lado do Lucas, atrás do login do painel).
//   GET  /api/admin/chat               -> lista de conversas (e marca "online" por 45 s)
//   GET  /api/admin/chat?vid=...       -> mensagens da conversa (e zera o "não lidas")
//   POST /api/admin/chat {a:'reply', vid, text} | {a:'delete', vid}
const { getRedis } = require('../_lib/redis');
const { requireAuth } = require('../_lib/auth');
const { bodyOf, clean, validVid, parse } = require('../_lib/util');

module.exports = async (req, res) => {
  if (!(await requireAuth(req, res))) return;
  res.setHeader('Cache-Control', 'no-store');
  let redis;
  try { redis = getRedis(); } catch { res.status(503).json({ error: 'indisponivel' }); return; }
  try {
    if (req.method === 'GET') {
      await redis.set('chat:online', '1', { ex: 45 }); // o visitante vê "online agora"
      const vid = validVid(req.query && req.query.vid);
      if (!vid) {
        const vids = (await redis.zrange('chat:idx', 0, 59, { rev: true })) || [];
        const metas = await Promise.all(vids.map((v) => redis.get('chat:meta:' + v)));
        const list = metas.map(parse).filter(Boolean);
        res.status(200).json({ list, unread: list.reduce((n, c) => n + (c.unread || 0), 0) });
        return;
      }
      const [raw, meta] = await Promise.all([redis.lrange('chat:m:' + vid, -200, -1), redis.get('chat:meta:' + vid)]);
      const m = parse(meta);
      if (m && m.unread) { m.unread = 0; await redis.set('chat:meta:' + vid, JSON.stringify(m)); }
      res.status(200).json({ msgs: (raw || []).map(parse).filter(Boolean), meta: m });
      return;
    }
    if (req.method === 'POST') {
      const body = bodyOf(req);
      const vid = validVid(body.vid);
      if (!vid) { res.status(400).json({ error: 'vid' }); return; }
      if (body.a === 'reply') {
        const text = clean(body.text, 1000).trim();
        if (!text) { res.status(400).json({ error: 'texto' }); return; }
        const now = Date.now();
        await redis.rpush('chat:m:' + vid, JSON.stringify({ t: now, f: 'a', x: text }));
        await redis.ltrim('chat:m:' + vid, -300, -1);
        const m = parse(await redis.get('chat:meta:' + vid)) || { vid };
        Object.assign(m, { last: now, lastText: text.slice(0, 120), lastFrom: 'a', unread: 0 });
        await redis.set('chat:meta:' + vid, JSON.stringify(m));
        await redis.zadd('chat:idx', { score: now, member: vid });
        res.status(200).json({ ok: true, t: now });
        return;
      }
      if (body.a === 'delete') {
        await Promise.all([redis.del('chat:m:' + vid), redis.del('chat:meta:' + vid), redis.zrem('chat:idx', vid)]);
        res.status(200).json({ ok: true });
        return;
      }
    }
    res.status(405).json({ error: 'metodo' });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
};
