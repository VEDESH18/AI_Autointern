const jobService = require('../services/job.service');
const axios = require('axios');

class JobController {
  async scrapeJob(req, res, next) {
    try {
      const { url } = req.body;
      const userId = req.userId;
      console.log('Scraping job for userId:', userId);
      
      const job = await jobService.scrapeJob(url, userId);
      console.log('Job scraped successfully:', job.title, job._id);
      
      // Trigger n8n webhook for job scraping
      try {
        await axios.post(`${process.env.N8N_WEBHOOK_URL}/job-scraped`, {
          jobId: job._id,
          userId,
          title: job.title,
          company: job.company
        });
      } catch (webhookError) {
        console.error('n8n webhook error:', webhookError.message);
      }
      
      res.status(201).json(job);
    } catch (error) {
      next(error);
    }
  }

  async getJobs(req, res, next) {
    try {
      const userId = req.userId;
      console.log('Fetching jobs for userId:', userId);
      const filters = {
        title: req.query.title,
        company: req.query.company,
        skills: req.query.skills ? req.query.skills.split(',') : undefined,
        limit: parseInt(req.query.limit) || 50
      };
      
      const jobs = await jobService.getAllJobs(userId, filters);
      console.log('Found jobs:', jobs.length);
      res.json(jobs);
    } catch (error) {
      next(error);
    }
  }

  async getJobById(req, res, next) {
    try {
      const job = await jobService.getJobById(req.params.id);
      res.json(job);
    } catch (error) {
      next(error);
    }
  }

  async deleteJob(req, res, next) {
    try {
      const result = await jobService.deleteJob(req.params.id, req.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new JobController();
