const Redis = require('redis');

// Cache expiration time (120 seconds)
const CACHE_TIME = 120;

const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

const cache = {
  async get(key) {
    try {
      return await redisClient.get(key);
    } catch (error) {
      console.error('Redis GET Error:', error);
      return null;
    }
  },

  async set(key, value) {
    try {
      return await redisClient.setEx(key, CACHE_TIME, JSON.stringify(value));
    } catch (error) {
      console.error('Redis SET Error:', error);
      return null;
    }
  }
};

redisClient.on('error', err => console.error('Redis Client Error:', err));
redisClient.connect().catch(console.error);

module.exports = { redisClient, cache };