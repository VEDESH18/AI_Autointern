const { chromium } = require('playwright');
const cheerio = require('cheerio');
const Job = require('../models/Job');

class JobScraperService {
  async scrapeJob(url, userId) {
    let browser;
    try {
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      
      const html = await page.content();
      const $ = cheerio.load(html);
      
      const extractedData = this.extractJobData($, url);
      
      const job = await Job.findOneAndUpdate(
        { url },
        {
          ...extractedData,
          rawHtml: html,
          userId,
          scrapedAt: new Date()
        },
        { upsert: true, new: true }
      );

      await browser.close();
      
      return job;
    } catch (error) {
      if (browser) await browser.close();
      throw new Error(`Scraping failed: ${error.message}`);
    }
  }

  extractJobData($, url) {
    const data = {
      url,
      title: '',
      company: '',
      location: '',
      description: '',
      requirements: [],
      skills: [],
      salary: '',
      jobType: ''
    };

    // LinkedIn selectors
    if (url.includes('linkedin.com')) {
      data.title = $('.top-card-layout__title').text().trim() || 
                    $('h1.topcard__title').text().trim();
      data.company = $('.topcard__org-name-link').text().trim() || 
                     $('.top-card-layout__card a').first().text().trim();
      data.location = $('.topcard__flavor--bullet').text().trim() ||
                      $('.top-card-layout__second-subline').text().trim();
      data.description = $('.show-more-less-html__markup').text().trim() ||
                         $('.description__text').text().trim();
      data.jobType = $('.description__job-criteria-text').first().text().trim();
    }
    
    // Indeed selectors
    else if (url.includes('indeed.com')) {
      data.title = $('.jobsearch-JobInfoHeader-title').text().trim() ||
                   $('h1.icl-u-xs-mb--xs').text().trim();
      data.company = $('[data-company-name="true"]').text().trim() ||
                     $('.jobsearch-InlineCompanyRating').first().text().trim();
      data.location = $('.jobsearch-JobInfoHeader-subtitle div').last().text().trim();
      data.description = $('#jobDescriptionText').text().trim();
      data.salary = $('.icl-u-xs-mr--xs').text().trim();
    }
    
    // Glassdoor selectors
    else if (url.includes('glassdoor.com')) {
      data.title = $('[data-test="job-title"]').text().trim();
      data.company = $('[data-test="employer-name"]').text().trim();
      data.location = $('[data-test="location"]').text().trim();
      data.description = $('[data-test="description"]').text().trim();
      data.salary = $('[data-test="salary"]').text().trim();
    }
    
    // Generic fallback
    else {
      data.title = $('h1').first().text().trim() || 
                   $('[class*="title"]').first().text().trim();
      data.company = $('[class*="company"]').first().text().trim();
      data.location = $('[class*="location"]').first().text().trim();
      data.description = $('[class*="description"]').text().trim() ||
                        $('main').text().trim();
    }

    // Extract skills using keywords
    const skillKeywords = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'React', 'Angular', 
      'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'SQL', 'MongoDB',
      'PostgreSQL', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'CI/CD',
      'REST', 'GraphQL', 'Microservices', 'Agile', 'Scrum', 'Machine Learning',
      'Data Science', 'TensorFlow', 'PyTorch', 'HTML', 'CSS', 'Tailwind', 'Bootstrap'
    ];

    const text = data.description.toLowerCase();
    data.skills = skillKeywords.filter(skill => 
      text.includes(skill.toLowerCase())
    );

    // Extract requirements
    const reqPatterns = [
      /requirements?:?\s*(.+?)(?=\n\n|responsibilities|qualifications|$)/is,
      /qualifications?:?\s*(.+?)(?=\n\n|responsibilities|requirements|$)/is,
      /must have:?\s*(.+?)(?=\n\n|nice to have|$)/is
    ];

    for (const pattern of reqPatterns) {
      const match = data.description.match(pattern);
      if (match) {
        const reqs = match[1].split(/\n|•|·|-/).filter(r => r.trim().length > 10);
        data.requirements.push(...reqs.map(r => r.trim()).slice(0, 10));
        break;
      }
    }

    return data;
  }

  async getAllJobs(userId, filters = {}) {
    const query = { userId };
    
    if (filters.title) {
      query.$text = { $search: filters.title };
    }
    
    if (filters.company) {
      query.company = new RegExp(filters.company, 'i');
    }
    
    if (filters.skills) {
      query.skills = { $in: filters.skills };
    }

    const jobs = await Job.find(query)
      .sort({ scrapedAt: -1 })
      .limit(filters.limit || 50);
    
    return jobs;
  }

  async getJobById(jobId) {
    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    return job;
  }

  async deleteJob(jobId, userId) {
    const result = await Job.deleteOne({ _id: jobId, userId });
    if (result.deletedCount === 0) {
      throw new Error('Job not found or unauthorized');
    }
    return { message: 'Job deleted successfully' };
  }
}

module.exports = new JobScraperService();
