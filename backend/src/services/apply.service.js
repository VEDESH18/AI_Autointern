const { Queue } = require('bullmq');
const prisma = require('../utils/prisma');
const Job = require('../models/Job');

const applyQueue = new Queue('apply', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  }
});

class ApplyService {
  async startApplication(userId, jobId, resumeId, coverLetter) {
    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId }
    });
    if (!resume) {
      throw new Error('Resume not found');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const application = await prisma.application.create({
      data: {
        userId,
        resumeId,
        jobId: job._id.toString(),
        jobTitle: job.title,
        company: job.company,
        status: 'queued',
        coverLetter
      }
    });

    await applyQueue.add('auto-apply', {
      applicationId: application.id,
      userId,
      jobUrl: job.url,
      userDetails: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      },
      resumeUrl: resume.pdfUrl,
      coverLetter
    });

    return {
      applicationId: application.id,
      status: 'queued',
      message: 'Application queued for processing'
    };
  }

  async getApplicationStatus(applicationId, userId) {
    const application = await prisma.application.findFirst({
      where: { id: applicationId, userId }
    });

    if (!application) {
      throw new Error('Application not found');
    }

    return application;
  }

  async getApplicationLogs(userId) {
    const applications = await prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return applications;
  }

  async updateApplicationStatus(applicationId, status, logs = null, screenshotUrl = null) {
    const updateData = {
      status,
      appliedAt: status === 'success' ? new Date() : undefined
    };

    if (logs) {
      updateData.logs = logs;
    }

    if (screenshotUrl) {
      updateData.screenshotUrl = screenshotUrl;
    }

    const application = await prisma.application.update({
      where: { id: applicationId },
      data: updateData
    });

    return application;
  }

  async getStats(userId) {
    const total = await prisma.application.count({
      where: { userId }
    });

    const success = await prisma.application.count({
      where: { userId, status: 'success' }
    });

    const pending = await prisma.application.count({
      where: { userId, status: { in: ['queued', 'processing'] } }
    });

    const failed = await prisma.application.count({
      where: { userId, status: 'failed' }
    });

    const recentApplications = await prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        jobTitle: true,
        company: true,
        status: true,
        createdAt: true
      }
    });

    return {
      total,
      success,
      pending,
      failed,
      successRate: total > 0 ? ((success / total) * 100).toFixed(2) : 0,
      recentApplications
    };
  }
}

module.exports = new ApplyService();
