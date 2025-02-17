// utils/redis.js
const Redis = require('redis');

const CACHE_TIME = 120;

const redisClient = Redis.createClient({
  url: process.env.REDIS_URL,
});

// Event handlers
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

redisClient.on('reconnecting', () => {
  console.log('Redis Client Reconnecting...');
});

// Connect with error handling
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Redis Connection Error:', err);
  }
})();

const cache = {
  async get(key) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      console.error('Redis GET Error:', err);
      return null;
    }
  },

  async set(key, value) {
    try {
      await redisClient.setEx(key, CACHE_TIME, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error('Redis SET Error:', err);
      return false;
    }
  }
};

module.exports = { redisClient, cache };