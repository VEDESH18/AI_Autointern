const applyService = require('../services/apply.service');

class ApplyController {
  async start(req, res, next) {
    try {
      const { jobId, resumeId, coverLetter } = req.body;
      const userId = req.userId;
      
      const result = await applyService.startApplication(
        userId,
        jobId,
        resumeId,
        coverLetter
      );
      
      res.status(202).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getStatus(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      
      const application = await applyService.getApplicationStatus(id, userId);
      res.json(application);
    } catch (error) {
      next(error);
    }
  }

  async getLogs(req, res, next) {
    try {
      const userId = req.userId;
      const applications = await applyService.getApplicationLogs(userId);
      res.json(applications);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const userId = req.userId;
      const stats = await applyService.getStats(userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ApplyController();
