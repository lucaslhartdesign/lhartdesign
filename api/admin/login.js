const { createSession, setSessionCookie } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }
  let body = req.body;
  if (!body || typeof body === 'string') {
    try { body = JSON.parse(body || '{}'); } catch { body = {}; }
  }
  const password = body && body.password;
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) { res.status(500).json({ error: 'ADMIN_PASSWORD not configured on the server' }); return; }
  if (!password || password !== expected) {
    res.status(401).json({ error: 'invalid password' });
    return;
  }
  const token = await createSession();
  setSessionCookie(res, token);
  res.status(200).json({ ok: true });
};
