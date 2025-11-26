const { Queue } = require('bullmq');
const Redis = require('redis');

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined
};

const scrapeQueue = new Queue('scrape', { connection: redisConnection });
const applyQueue = new Queue('apply', { connection: redisConnection });
const interviewQueue = new Queue('interview', { connection: redisConnection });

module.exports = {
  scrapeQueue,
  applyQueue,
  interviewQueue,
  redisConnection
};
