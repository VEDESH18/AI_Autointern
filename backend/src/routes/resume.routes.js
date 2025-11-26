const express = require('express');
const { z } = require('zod');
const resumeController = require('../controllers/resume.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

const saveResumeSchema = z.object({
  title: z.string().optional(),
  personalInfo: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
    summary: z.string().optional()
  }),
  experience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    highlights: z.array(z.string()).optional()
  })),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    gpa: z.string().optional()
  })),
  skills: z.object({
    technical: z.array(z.string()),
    soft: z.array(z.string()).optional()
  }),
  projects: z.array(z.any()).optional(),
  certifications: z.array(z.any()).optional()
});

const tailorResumeSchema = z.object({
  jobId: z.string()
});

/**
 * @swagger
 * /resume/save:
 *   post:
 *     summary: Save a new resume
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Resume saved
 */
router.post('/save', authenticate, validate(saveResumeSchema), resumeController.saveResume);

/**
 * @swagger
 * /resume:
 *   get:
 *     summary: Get all resumes
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of resumes
 */
router.get('/', authenticate, resumeController.getResumes);

/**
 * @swagger
 * /resume/{id}:
 *   get:
 *     summary: Get resume by ID
 *     tags: [Resume]
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
 *         description: Resume details
 */
router.get('/:id', authenticate, resumeController.getResume);

/**
 * @swagger
 * /resume/{id}/tailor:
 *   post:
 *     summary: Tailor resume for specific job
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *             properties:
 *               jobId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tailored resume
 */
router.post('/:id/tailor', authenticate, validate(tailorResumeSchema), resumeController.tailorResume);

/**
 * @swagger
 * /resume/pdf:
 *   post:
 *     summary: Generate PDF from resume
 *     tags: [Resume]
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
 *         description: PDF generated
 */
router.post('/:id/pdf', authenticate, resumeController.generatePDF);

/**
 * @swagger
 * /resume/{id}:
 *   delete:
 *     summary: Delete resume
 *     tags: [Resume]
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
 *         description: Resume deleted
 */
router.delete('/:id', authenticate, resumeController.deleteResume);

module.exports = router;
