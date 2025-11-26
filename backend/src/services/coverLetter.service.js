const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Job = require('../models/Job');
const prisma = require('../utils/prisma');

class CoverLetterService {
  async generate(userId, jobId, resumeId, customPrompt = null) {
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

    const coverLetter = customPrompt 
      ? await this.generateWithAI(job, resume, customPrompt)
      : this.generateTemplate(job, resume);

    return {
      content: coverLetter,
      jobTitle: job.title,
      company: job.company,
      date: new Date().toISOString()
    };
  }

  async generateWithAI(job, resume, customPrompt) {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key') {
      return this.generateTemplate(job, resume);
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional cover letter writer. Write compelling, personalized cover letters that highlight relevant experience and skills.'
            },
            {
              role: 'user',
              content: `Write a cover letter for this job:
                
Job Title: ${job.title}
Company: ${job.company}
Description: ${job.description}

Candidate Info:
Name: ${resume.personalInfo.firstName} ${resume.personalInfo.lastName}
Experience: ${JSON.stringify(resume.experience)}
Skills: ${JSON.stringify(resume.skills)}

${customPrompt ? `Additional Instructions: ${customPrompt}` : ''}

Write a professional cover letter in 3-4 paragraphs.`
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI error:', error.message);
      return this.generateTemplate(job, resume);
    }
  }

  generateTemplate(job, resume) {
    const { firstName, lastName, email, phone, location } = resume.personalInfo;
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const relevantExperience = resume.experience[0];
    const topSkills = resume.skills.technical.slice(0, 5).join(', ');

    return `${firstName} ${lastName}
${location || ''}
${email}
${phone}

${today}

Hiring Manager
${job.company}

Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company}. With my background in ${relevantExperience?.title || 'software development'} and expertise in ${topSkills}, I am confident in my ability to contribute effectively to your team.

In my previous role at ${relevantExperience?.company || 'my current company'}, I ${relevantExperience?.highlights?.[0] || 'developed and maintained critical applications'}. This experience has equipped me with the technical skills and problem-solving abilities that align perfectly with the requirements outlined in your job posting.

I am particularly drawn to ${job.company} because of your commitment to innovation and excellence. The ${job.title} role presents an exciting opportunity to apply my skills in ${topSkills} while contributing to meaningful projects that make a real impact.

I am excited about the possibility of bringing my unique blend of skills and experience to your team. Thank you for considering my application. I look forward to the opportunity to discuss how I can contribute to ${job.company}'s success.

Sincerely,
${firstName} ${lastName}`;
  }

  async generatePDF(coverLetterContent, metadata) {
    const uploadsDir = path.join(__dirname, '../../uploads/cover-letters');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `cover_letter_${Date.now()}.pdf`;
    const filepath = path.join(uploadsDir, filename);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 72 });
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      doc.fontSize(11).text(coverLetterContent, {
        align: 'left',
        lineGap: 5
      });

      doc.end();

      stream.on('finish', () => {
        resolve({ 
          url: `/uploads/cover-letters/${filename}`, 
          filename 
        });
      });

      stream.on('error', reject);
    });
  }

  async saveCoverLetter(userId, jobId, content) {
    const job = await Job.findById(jobId);
    
    const application = await prisma.application.findFirst({
      where: {
        userId,
        jobId
      }
    });

    if (application) {
      await prisma.application.update({
        where: { id: application.id },
        data: { coverLetter: content }
      });
    }

    return { message: 'Cover letter saved', content };
  }
}

module.exports = new CoverLetterService();
