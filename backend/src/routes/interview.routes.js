const express = require('express');
const { z } = require('zod');
const interviewController = require('../controllers/interview.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

const generateQuestionsSchema = z.object({
  jobId: z.string()
});

const submitAnswersSchema = z.object({
  interviewId: z.string(),
  answers: z.array(z.object({
    questionId: z.number(),
    answer: z.string()
  }))
});

/**
 * @swagger
 * /interview/questions:
 *   post:
 *     summary: Generate interview questions
 *     tags: [Interview]
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
 *             properties:
 *               jobId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Questions generated
 */
router.post('/questions', authenticate, validate(generateQuestionsSchema), interviewController.generateQuestions);

/**
 * @swagger
 * /interview/evaluate:
 *   post:
 *     summary: Submit and evaluate answers
 *     tags: [Interview]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - interviewId
 *               - answers
 *             properties:
 *               interviewId:
 *                 type: string
 *               answers:
 *                 type: array
 *     responses:
 *       200:
 *         description: Answers evaluated
 */
router.post('/evaluate', authenticate, validate(submitAnswersSchema), interviewController.submitAnswers);

/**
 * @swagger
 * /interview/history:
 *   get:
 *     summary: Get interview history
 *     tags: [Interview]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Interview history
 */
router.get('/history', authenticate, interviewController.getHistory);

/**
 * @swagger
 * /interview/{id}:
 *   get:
 *     summary: Get interview by ID
 *     tags: [Interview]
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
 *         description: Interview details
 */
router.get('/:id', authenticate, interviewController.getInterview);

module.exports = router;
