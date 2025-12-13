const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const prisma = require('../utils/prisma');
const Job = require('../models/Job');

class ResumeService {
  async saveResume(userId, resumeData) {
    const latestResume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { version: 'desc' }
    });

    const version = latestResume ? latestResume.version + 1 : 1;

    const resume = await prisma.resume.create({
      data: {
        userId,
        title: resumeData.title || `Resume v${version}`,
        personalInfo: resumeData.personalInfo,
        experience: resumeData.experience,
        education: resumeData.education,
        skills: resumeData.skills,
        projects: resumeData.projects || {},
        certifications: resumeData.certifications || {},
        version
      }
    });

    return resume;
  }

  async getResumes(userId) {
    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return resumes;
  }

  async getResumeById(resumeId, userId) {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId }
    });

    if (!resume) {
      throw new Error('Resume not found');
    }

    return resume;
  }

  async tailorResume(resumeId, jobId, userId) {
    const resume = await this.getResumeById(resumeId, userId);
    const job = await Job.findById(jobId);

    if (!job) {
      throw new Error('Job not found');
    }

    const tailoredSkills = this.matchSkills(resume.skills, job.skills);
    const tailoredExperience = this.enhanceExperience(resume.experience, job.skills);

    const tailoredResume = await prisma.resume.create({
      data: {
        userId,
        title: `${resume.title} - Tailored for ${job.company}`,
        personalInfo: resume.personalInfo,
        experience: tailoredExperience,
        education: resume.education,
        skills: tailoredSkills,
        projects: resume.projects,
        certifications: resume.certifications,
        version: resume.version + 1
      }
    });

    return tailoredResume;
  }

  matchSkills(resumeSkills, jobSkills) {
    const allSkills = resumeSkills.technical || [];
    const matched = allSkills.filter(skill =>
      jobSkills.some(jobSkill =>
        jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(jobSkill.toLowerCase())
      )
    );

    return {
      ...resumeSkills,
      technical: [...new Set([...matched, ...allSkills])].slice(0, 15),
      highlighted: matched
    };
  }

  enhanceExperience(experience, jobSkills) {
    return experience.map(exp => ({
      ...exp,
      highlights: exp.highlights || exp.responsibilities || [],
      relevance: this.calculateRelevance(exp, jobSkills)
    }));
  }

  calculateRelevance(experience, jobSkills) {
    const text = JSON.stringify(experience).toLowerCase();
    const matches = jobSkills.filter(skill =>
      text.includes(skill.toLowerCase())
    );
    return (matches.length / jobSkills.length) * 100;
  }

  async generatePDF(resumeId, userId) {
    const resume = await this.getResumeById(resumeId, userId);
    
    const uploadsDir = path.join(__dirname, '../../uploads/resumes');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `resume_${resumeId}_${Date.now()}.pdf`;
    const filepath = path.join(uploadsDir, filename);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Header
      const personalInfo = resume.personalInfo;
      doc.fontSize(24).text(
        `${personalInfo.firstName} ${personalInfo.lastName}`,
        { align: 'center' }
      );
      doc.fontSize(10).text(
        `${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.location || ''}`,
        { align: 'center' }
      );
      
      if (personalInfo.linkedin) {
        doc.text(personalInfo.linkedin, { align: 'center', link: personalInfo.linkedin });
      }

      doc.moveDown();

      // Professional Summary
      if (personalInfo.summary) {
        doc.fontSize(14).text('PROFESSIONAL SUMMARY', { underline: true });
        doc.fontSize(10).text(personalInfo.summary);
        doc.moveDown();
      }

      // Skills
      doc.fontSize(14).text('SKILLS', { underline: true });
      const skills = resume.skills;
      if (skills.technical) {
        doc.fontSize(10).text(`Technical: ${skills.technical.join(', ')}`);
      }
      if (skills.soft) {
        doc.fontSize(10).text(`Soft Skills: ${skills.soft.join(', ')}`);
      }
      doc.moveDown();

      // Experience
      doc.fontSize(14).text('EXPERIENCE', { underline: true });
      resume.experience.forEach(exp => {
        doc.fontSize(12).text(exp.title, { continued: true });
        doc.fontSize(10).text(` - ${exp.company}`, { align: 'right' });
        doc.fontSize(9).text(`${exp.startDate} - ${exp.endDate || 'Present'}`);
        
        if (exp.highlights) {
          exp.highlights.forEach(highlight => {
            doc.fontSize(9).text(`• ${highlight}`, { indent: 20 });
          });
        }
        doc.moveDown();
      });

      // Education
      doc.fontSize(14).text('EDUCATION', { underline: true });
      resume.education.forEach(edu => {
        doc.fontSize(11).text(`${edu.degree} - ${edu.institution}`);
        doc.fontSize(9).text(`${edu.startDate} - ${edu.endDate || 'Present'}`);
        if (edu.gpa) {
          doc.text(`GPA: ${edu.gpa}`);
        }
        doc.moveDown();
      });

      // Projects
      if (resume.projects && resume.projects.length > 0) {
        doc.fontSize(14).text('PROJECTS', { underline: true });
        resume.projects.forEach(project => {
          doc.fontSize(11).text(project.name);
          doc.fontSize(9).text(project.description);
          if (project.technologies) {
            doc.text(`Technologies: ${project.technologies.join(', ')}`);
          }
          doc.moveDown();
        });
      }

      // Certifications
      if (resume.certifications && resume.certifications.length > 0) {
        doc.fontSize(14).text('CERTIFICATIONS', { underline: true });
        resume.certifications.forEach(cert => {
          doc.fontSize(10).text(`• ${cert.name} - ${cert.issuer} (${cert.date})`);
        });
      }

      doc.end();

      stream.on('finish', async () => {
        const pdfUrl = `/uploads/resumes/${filename}`;
        await prisma.resume.update({
          where: { id: resumeId },
          data: { pdfUrl }
        });
        resolve({ url: pdfUrl, filename });
      });

      stream.on('error', reject);
    });
  }

  async deleteResume(resumeId, userId) {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId }
    });

    if (!resume) {
      throw new Error('Resume not found');
    }

    await prisma.resume.delete({
      where: { id: resumeId }
    });

    return { message: 'Resume deleted successfully' };
  }

  async downloadResume(resumeId, userId) {
    const resume = await this.getResumeById(resumeId, userId);
    
    // If PDF doesn't exist, generate it first
    if (!resume.pdfUrl) {
      await this.generatePDF(resumeId, userId);
      const updatedResume = await this.getResumeById(resumeId, userId);
      resume.pdfUrl = updatedResume.pdfUrl;
    }

    const filepath = path.join(__dirname, '../../', resume.pdfUrl);
    
    if (!fs.existsSync(filepath)) {
      throw new Error('PDF file not found. Please regenerate the resume.');
    }

    const filename = `resume_${resume.personalInfo.firstName}_${resume.personalInfo.lastName}.pdf`;
    return { filepath, filename };
  }
}

module.exports = new ResumeService();
