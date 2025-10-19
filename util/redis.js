//util/redis.js
// redis is a fast in-memory/temporary data store inwhich BullMQ uses to store and track jobs
//Shared Redis client for BullMQ

const { Queue, Worker, QueueScheduler } = require('bullmq');
const IORedis = require('ioredis');

const connectionRedis = new IORedis({   //new IORedis('redis://127.0.0.1:6379');
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASS || undefined,    //for development
  maxRetriesPerRequest: null,   // ✅ REQUIRED for BullMQ
  enableReadyCheck: false       // ✅ prevents "Ready check" errors
});

connectionRedis.on('connect', () => console.log('✅ Redis connected successfully!'));
connectionRedis.on('error', (err) => console.error('❌ Redis connection error:', err));

module.exports = { connectionRedis };
