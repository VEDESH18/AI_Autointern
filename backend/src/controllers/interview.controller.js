const interviewService = require('../services/interview.service');

class InterviewController {
  async generateQuestions(req, res, next) {
    try {
      const { jobId } = req.body;
      const userId = req.userId;
      
      const interview = await interviewService.generateQuestions(userId, jobId);
      res.json(interview);
    } catch (error) {
      next(error);
    }
  }

  async submitAnswers(req, res, next) {
    try {
      const { interviewId, answers } = req.body;
      const userId = req.userId;
      
      const result = await interviewService.submitAnswers(interviewId, userId, answers);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const userId = req.userId;
      const history = await interviewService.getInterviewHistory(userId);
      res.json(history);
    } catch (error) {
      next(error);
    }
  }

  async getInterview(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      
      const interview = await interviewService.getInterviewById(id, userId);
      res.json(interview);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InterviewController();
