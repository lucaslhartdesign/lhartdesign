const { Redis } = require('@upstash/redis');

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

let client = null;
function getRedis() {
  if (!url || !token) {
    throw new Error('Redis is not configured: missing KV_REST_API_URL/KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL/TOKEN) env vars.');
  }
  if (!client) client = new Redis({ url, token });
  return client;
}

module.exports = { getRedis };
