const express = require('express');
const { z } = require('zod');
const jobController = require('../controllers/job.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

const scrapeJobSchema = z.object({
  url: z.string().url()
});

/**
 * @swagger
 * /jobs/scrape:
 *   post:
 *     summary: Scrape a job from URL
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Job scraped successfully
 */
router.post('/scrape', authenticate, validate(scrapeJobSchema), jobController.scrapeJob);

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get all scraped jobs
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of jobs
 */
router.get('/', authenticate, jobController.getJobs);

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job details
 */
router.get('/:id', authenticate, jobController.getJobById);

/**
 * @swagger
 * /jobs/{id}:
 *   delete:
 *     summary: Delete job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job deleted
 */
router.delete('/:id', authenticate, jobController.deleteJob);

module.exports = router;
