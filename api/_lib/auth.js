const crypto = require('crypto');
const { getRedis } = require('./redis');

const COOKIE_NAME = 'lh_admin_session';
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

function parseCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  });
  return out;
}

async function createSession() {
  const token = crypto.randomBytes(32).toString('hex');
  const redis = getRedis();
  await redis.set(`session:${token}`, '1', { ex: SESSION_TTL_SECONDS });
  return token;
}

async function isAuthed(req) {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (!token) return false;
  try {
    const redis = getRedis();
    const val = await redis.get(`session:${token}`);
    return !!val;
  } catch {
    return false;
  }
}

function setSessionCookie(res, token) {
  const secure = process.env.NODE_ENV !== 'development';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${SESSION_TTL_SECONDS}; SameSite=Lax${secure ? '; Secure' : ''}`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
}

async function requireAuth(req, res) {
  const ok = await isAuthed(req);
  if (!ok) {
    res.status(401).json({ error: 'unauthorized' });
    return false;
  }
  return true;
}

module.exports = { COOKIE_NAME, parseCookies, createSession, isAuthed, setSessionCookie, clearSessionCookie, requireAuth };
