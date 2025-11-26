const { Worker } = require('bullmq');
const { redisConnection } = require('./queue');
const axios = require('axios');

const interviewWorker = new Worker('interview', async (job) => {
  const { interviewId, userId, jobTitle } = job.data;
  
  console.log(`[Interview Worker] Generating questions for interview ${interviewId}`);
  
  try {
    // Generate interview questions using OpenAI or templates
    const questions = await generateInterviewQuestions(jobTitle);
    
    // Update interview in database
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        questions: { items: questions }
      }
    });
    
    await prisma.$disconnect();
    
    // Notify n8n
    if (process.env.N8N_WEBHOOK_URL) {
      await axios.post(`${process.env.N8N_WEBHOOK_URL}/interview-ready`, {
        interviewId,
        userId,
        jobTitle
      });
    }
    
    console.log(`[Interview Worker] Interview ${interviewId} questions generated`);
    return { success: true, questions };
  } catch (error) {
    console.error(`[Interview Worker] Error:`, error);
    throw error;
  }
}, {
  connection: redisConnection,
  concurrency: 5
});

async function generateInterviewQuestions(jobTitle) {
  // Template questions
  return [
    { question: `Tell me about your experience relevant to ${jobTitle}`, type: 'behavioral', difficulty: 'medium' },
    { question: 'Describe a challenging project you worked on', type: 'behavioral', difficulty: 'medium' },
    { question: 'How do you handle tight deadlines?', type: 'situational', difficulty: 'medium' },
    { question: 'What are your technical strengths?', type: 'technical', difficulty: 'easy' },
    { question: 'Where do you see yourself in 5 years?', type: 'behavioral', difficulty: 'easy' }
  ];
}

interviewWorker.on('completed', (job) => {
  console.log(`[Interview Worker] Job ${job.id} completed`);
});

interviewWorker.on('failed', (job, err) => {
  console.error(`[Interview Worker] Job ${job.id} failed:`, err.message);
});

console.log('✓ Interview Worker started');

module.exports = interviewWorker;
