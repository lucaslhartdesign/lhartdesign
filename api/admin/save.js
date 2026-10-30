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

function cleanResults(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, 20).map((r) => ({
    tag: String((r && r.tag) || '').slice(0, 60),
    title: String((r && r.title) || '').slice(0, 100),
    metric: String((r && r.metric) || '').slice(0, 60),
    before: Math.max(0, Number(r && r.before) || 0),
    after: Math.max(0, Number(r && r.after) || 0),
    note: String((r && r.note) || '').slice(0, 300),
  }));
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }
  if (!(await requireAuth(req, res))) return;
  let body = req.body;
  if (!body || typeof body === 'string') {
    try { body = JSON.parse(body || '{}'); } catch { body = {}; }
  }
  const { key, data, reset } = body || {};
  const redis = getRedis();

  // Mapa de Bateria: mp3 do Lucas em pedaços de até ~1 MB (base64), atrás do login
  if (key === 'audio' || key === 'audio-apagar') {
    const id = String((data && data.id) || '');
    if (!/^[\w-]{1,80}$/.test(id)) { res.status(400).json({ error: 'bad id' }); return; }
    if (key === 'audio-apagar') {
      const meta = await redis.get(`bateria:audio:${id}:meta`);
      const total = (meta && (typeof meta === 'string' ? JSON.parse(meta) : meta).total) || 0;
      const chaves = [`bateria:audio:${id}:meta`];
      for (let i = 0; i < Math.min(total, 200); i++) chaves.push(`bateria:audio:${id}:${i}`);
      await redis.del(...chaves);
      res.status(200).json({ ok: true });
      return;
    }
    const i = Number(data.i), total = Number(data.total), d = String(data.d || '');
    if (!Number.isInteger(i) || !Number.isInteger(total) || total < 1 || total > 200 || i < 0 || i >= total) { res.status(400).json({ error: 'bad chunk' }); return; }
    if (!d || d.length > 1000000 || !/^[A-Za-z0-9+/=]+$/.test(d)) { res.status(400).json({ error: 'bad data' }); return; }
    await redis.set(`bateria:audio:${id}:${i}`, JSON.stringify({ d }));
    // a ficha só aparece com o último pedaço: até lá, os outros aparelhos não tentam baixar
    if (i === total - 1) await redis.set(`bateria:audio:${id}:meta`, JSON.stringify({ total, tipo: String(data.tipo || 'audio/mpeg').slice(0, 40), em: Date.now() }));
    res.status(200).json({ ok: true });
    return;
  }

  // Mapa de Bateria (/bateria/): guarda o conjunto inteiro de músicas e listas de ensaio
  if (key === 'bateria') {
    if (!data || typeof data !== 'object' || !Array.isArray(data.musicas)) { res.status(400).json({ error: 'invalid bateria payload' }); return; }
    const clean = {
      musicas: data.musicas.filter((m) => m && typeof m.id === 'string' && typeof m.texto === 'string').slice(0, 400),
      listas: Array.isArray(data.listas) ? data.listas.filter((l) => l && typeof l.id === 'string').slice(0, 200) : [],
      ocultas: Array.isArray(data.ocultas) ? data.ocultas.filter((x) => typeof x === 'string').slice(0, 400) : [],
      listasApagadas: Array.isArray(data.listasApagadas) ? data.listasApagadas.filter((x) => typeof x === 'string').slice(0, 400) : [],
      atualizado: Date.now(),
    };
    const json = JSON.stringify(clean);
    if (json.length > 900000) { res.status(413).json({ error: 'too large' }); return; }
    await redis.set('bateria:dados', json);
    res.status(200).json({ ok: true, atualizado: clean.atualizado });
    return;
  }

  // "Restore site default": drop the saved override so the site goes back to its built-in (translated) content.
  if (reset === true) {
    if (!['testimonials', 'plans', 'videos', 'results'].includes(key)) { res.status(400).json({ error: 'unknown key: ' + key }); return; }
    await redis.del('content:' + key);
    res.status(200).json({ ok: true, reset: true });
    return;
  }

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
    const vid = (v) => (/^\d+$/.test(String(v || '')) ? String(v) : '');
    const clean = {
      hero: vid(data.hero),
      threedInterior: vid(data.threedInterior),
      threedFacade: vid(data.threedFacade),
      items: Array.isArray(data.items)
        ? data.items
          .map((it) => ({
            vimeoId: vid(it && it.vimeoId),
            title: String((it && it.title) || '').slice(0, 80),
            description: String((it && it.description) || '').slice(0, 200),
          }))
          .filter((it) => it.vimeoId)
          .slice(0, 12)
        : [],
    };
    await redis.set('content:videos', JSON.stringify(clean));
    res.status(200).json({ ok: true, data: clean });
    return;
  }
  if (key === 'results') {
    const clean = cleanResults(data);
    await redis.set('content:results', JSON.stringify(clean));
    res.status(200).json({ ok: true, data: clean });
    return;
  }
  res.status(400).json({ error: 'unknown key: ' + key });
};
