const { Worker } = require('bullmq');
const { redisConnection } = require('./queue');
const { scrapeJob } = require('../automation/scrapeJob');
const cheerio = require('cheerio');
const Job = require('../backend/src/models/Job');
const axios = require('axios');

const scrapeWorker = new Worker('scrape', async (job) => {
  const { url, userId } = job.data;
  
  console.log(`[Scrape Worker] Processing job scraping for URL: ${url}`);
  
  try {
    const html = await scrapeJob(url);
    const $ = cheerio.load(html);
    
    // Extract job data (similar to job service logic)
    const jobData = {
      url,
      title: $('h1').first().text().trim() || 'Unknown Title',
      company: $('[class*="company"]').first().text().trim() || 'Unknown Company',
      description: $('[class*="description"]').text().trim() || '',
      skills: [],
      userId,
      rawHtml: html
    };
    
    // Save to MongoDB
    await Job.findOneAndUpdate(
      { url },
      jobData,
      { upsert: true, new: true }
    );
    
    // Notify n8n
    if (process.env.N8N_WEBHOOK_URL) {
      await axios.post(`${process.env.N8N_WEBHOOK_URL}/job-scraped`, {
        url,
        userId,
        status: 'success'
      });
    }
    
    console.log(`[Scrape Worker] Successfully scraped job: ${jobData.title}`);
    return { success: true, jobData };
  } catch (error) {
    console.error(`[Scrape Worker] Error:`, error);
    throw error;
  }
}, {
  connection: redisConnection,
  concurrency: 3
});

scrapeWorker.on('completed', (job) => {
  console.log(`[Scrape Worker] Job ${job.id} completed`);
});

scrapeWorker.on('failed', (job, err) => {
  console.error(`[Scrape Worker] Job ${job.id} failed:`, err.message);
});

console.log('✓ Scrape Worker started');

module.exports = scrapeWorker;
