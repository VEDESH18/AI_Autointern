const coverLetterService = require('../services/coverLetter.service');

class CoverLetterController {
  async generate(req, res, next) {
    try {
      const { jobId, resumeId, customPrompt } = req.body;
      const userId = req.userId;
      
      const coverLetter = await coverLetterService.generate(
        userId,
        jobId,
        resumeId,
        customPrompt
      );
      
      res.json(coverLetter);
    } catch (error) {
      next(error);
    }
  }

  async generatePDF(req, res, next) {
    try {
      const { content, jobTitle, company } = req.body;
      
      const result = await coverLetterService.generatePDF(content, {
        jobTitle,
        company
      });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async save(req, res, next) {
    try {
      const { jobId, content } = req.body;
      const userId = req.userId;
      
      const result = await coverLetterService.saveCoverLetter(
        userId,
        jobId,
        content
      );
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CoverLetterController();
