const express = require('express');
const { z } = require('zod');
const coverLetterController = require('../controllers/coverLetter.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

const generateSchema = z.object({
  jobId: z.string(),
  resumeId: z.string(),
  customPrompt: z.string().optional()
});

const pdfSchema = z.object({
  content: z.string(),
  jobTitle: z.string().optional(),
  company: z.string().optional()
});

const saveSchema = z.object({
  jobId: z.string(),
  content: z.string()
});

/**
 * @swagger
 * /cover-letter/generate:
 *   post:
 *     summary: Generate cover letter
 *     tags: [Cover Letter]
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
 *               customPrompt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cover letter generated
 */
router.post('/generate', authenticate, validate(generateSchema), coverLetterController.generate);

/**
 * @swagger
 * /cover-letter/pdf:
 *   post:
 *     summary: Generate PDF from cover letter
 *     tags: [Cover Letter]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               jobTitle:
 *                 type: string
 *               company:
 *                 type: string
 *     responses:
 *       200:
 *         description: PDF generated
 */
router.post('/pdf', authenticate, validate(pdfSchema), coverLetterController.generatePDF);

/**
 * @swagger
 * /cover-letter/save:
 *   post:
 *     summary: Save cover letter
 *     tags: [Cover Letter]
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
 *               - content
 *             properties:
 *               jobId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cover letter saved
 */
router.post('/save', authenticate, validate(saveSchema), coverLetterController.save);

module.exports = router;
