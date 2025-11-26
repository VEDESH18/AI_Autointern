const express = require('express');
const { z } = require('zod');
const applyController = require('../controllers/apply.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

const startApplicationSchema = z.object({
  jobId: z.string(),
  resumeId: z.string(),
  coverLetter: z.string().optional()
});

/**
 * @swagger
 * /apply/start:
 *   post:
 *     summary: Start auto-apply process
 *     tags: [Apply]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *               - resumeId
 *             properties:
 *               jobId:
 *                 type: string
 *               resumeId:
 *                 type: string
 *               coverLetter:
 *                 type: string
 *     responses:
 *       202:
 *         description: Application queued
 */
router.post('/start', authenticate, validate(startApplicationSchema), applyController.start);

/**
 * @swagger
 * /apply/status/{id}:
 *   get:
 *     summary: Get application status
 *     tags: [Apply]
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
 *         description: Application status
 */
router.get('/status/:id', authenticate, applyController.getStatus);

/**
 * @swagger
 * /apply/logs:
 *   get:
 *     summary: Get application logs
 *     tags: [Apply]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Application logs
 */
router.get('/logs', authenticate, applyController.getLogs);

/**
 * @swagger
 * /apply/stats:
 *   get:
 *     summary: Get application statistics
 *     tags: [Apply]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Application statistics
 */
router.get('/stats', authenticate, applyController.getStats);

module.exports = router;
