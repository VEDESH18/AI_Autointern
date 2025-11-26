const { Worker } = require('bullmq');
const { redisConnection } = require('./queue');
const { autoApply } = require('../automation/autoApply');
const path = require('path');
const axios = require('axios');

const applyWorker = new Worker('apply', async (job) => {
  const { 
    applicationId, 
    userId, 
    jobUrl, 
    userDetails, 
    resumeUrl, 
    coverLetter 
  } = job.data;
  
  console.log(`[Apply Worker] Processing application ${applicationId}`);
  
  try {
    // Update status to processing
    await updateApplicationStatus(applicationId, 'processing');
    
    // Get absolute path to resume
    const resumePath = resumeUrl 
      ? path.join(__dirname, '../backend', resumeUrl)
      : null;
    
    // Run automation
    const result = await autoApply(jobUrl, userDetails, resumePath, coverLetter);
    
    // Update application with results
    await updateApplicationStatus(
      applicationId,
      result.success ? 'success' : 'failed',
      result.logs,
      result.screenshotUrl
    );
    
    // Notify n8n
    if (process.env.N8N_WEBHOOK_URL) {
      await axios.post(`${process.env.N8N_WEBHOOK_URL}/application-completed`, {
        applicationId,
        userId,
        status: result.success ? 'success' : 'failed',
        jobUrl
      });
    }
    
    console.log(`[Apply Worker] Application ${applicationId} completed with status: ${result.success ? 'success' : 'failed'}`);
    return result;
  } catch (error) {
    console.error(`[Apply Worker] Error:`, error);
    await updateApplicationStatus(applicationId, 'failed', [
      { timestamp: new Date(), message: error.message, error: true }
    ]);
    throw error;
  }
}, {
  connection: redisConnection,
  concurrency: 2
});

async function updateApplicationStatus(applicationId, status, logs = null, screenshotUrl = null) {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const updateData = {
      status,
      appliedAt: status === 'success' ? new Date() : undefined
    };
    
    if (logs) {
      updateData.logs = { items: logs };
    }
    
    if (screenshotUrl) {
      updateData.screenshotUrl = screenshotUrl;
    }
    
    await prisma.application.update({
      where: { id: applicationId },
      data: updateData
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Failed to update application status:', error);
  }
}

applyWorker.on('completed', (job) => {
  console.log(`[Apply Worker] Job ${job.id} completed`);
});

applyWorker.on('failed', (job, err) => {
  console.error(`[Apply Worker] Job ${job.id} failed:`, err.message);
});

console.log('✓ Apply Worker started');

module.exports = applyWorker;
