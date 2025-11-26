const resumeService = require('../services/resume.service');

class ResumeController {
  async saveResume(req, res, next) {
    try {
      const resume = await resumeService.saveResume(req.userId, req.body);
      res.status(201).json(resume);
    } catch (error) {
      next(error);
    }
  }

  async getResumes(req, res, next) {
    try {
      const resumes = await resumeService.getResumes(req.userId);
      res.json(resumes);
    } catch (error) {
      next(error);
    }
  }

  async getResume(req, res, next) {
    try {
      const resume = await resumeService.getResumeById(req.params.id, req.userId);
      res.json(resume);
    } catch (error) {
      next(error);
    }
  }

  async tailorResume(req, res, next) {
    try {
      const { jobId } = req.body;
      const resume = await resumeService.tailorResume(req.params.id, jobId, req.userId);
      res.json(resume);
    } catch (error) {
      next(error);
    }
  }

  async generatePDF(req, res, next) {
    try {
      const result = await resumeService.generatePDF(req.params.id, req.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteResume(req, res, next) {
    try {
      const result = await resumeService.deleteResume(req.params.id, req.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ResumeController();
