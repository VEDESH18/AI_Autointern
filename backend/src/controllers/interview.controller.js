const interviewService = require('../services/interview.service');

class InterviewController {
  async generateQuestions(req, res, next) {
    try {
      const { jobTitle, company, jobDescription, jobId } = req.body;
      const userId = req.userId;
      
      console.log('Generating interview questions for:', { jobTitle, company, jobDescription: jobDescription?.substring(0, 50) });
      
      // Support both old (jobId) and new (jobTitle/company/description) formats
      const interview = await interviewService.generateQuestions(
        userId, 
        jobId, 
        { jobTitle, company, jobDescription }
      );
      
      console.log('Interview generated with ID:', interview.id);
      res.json(interview);
    } catch (error) {
      next(error);
    }
  }

  async submitAnswers(req, res, next) {
    try {
      const { interviewId, answers } = req.body;
      const userId = req.userId;
      const paramId = req.params.id;
      
      // Support both formats: body.interviewId or params.id
      const finalInterviewId = interviewId || paramId;
      
      const result = await interviewService.submitAnswers(finalInterviewId, userId, answers);
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

  async deleteInterview(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      
      await interviewService.deleteInterview(id, userId);
      res.json({ message: 'Interview deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InterviewController();
