const axios = require('axios');
const prisma = require('../utils/prisma');
const Job = require('../models/Job');

class InterviewService {
  async generateQuestions(userId, jobId, jobDetails = {}) {
    let jobTitle, company, skills, jobDescription;

    console.log('generateQuestions called with:', { userId, jobId, hasJobDetails: !!jobDetails.jobTitle });

    if (jobId) {
      // Old format: fetch job from database
      const job = await Job.findById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }
      jobTitle = job.title;
      company = job.company;
      skills = job.skills || [];
      jobDescription = job.description;
    } else if (jobDetails.jobTitle) {
      // New format: use provided details
      jobTitle = jobDetails.jobTitle;
      company = jobDetails.company || 'Unknown Company';
      skills = [];
      jobDescription = jobDetails.jobDescription || '';
      
      // Extract skills from description if available
      if (jobDescription) {
        const skillKeywords = [
          'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'React', 'Angular', 
          'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'SQL', 'MongoDB',
          'PostgreSQL', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git'
        ];
        const text = jobDescription.toLowerCase();
        skills = skillKeywords.filter(skill => text.includes(skill.toLowerCase()));
      }
    } else {
      throw new Error('Either jobId or job details (jobTitle, company) are required');
    }

    console.log('Generating questions for:', { jobTitle, company, skillCount: skills.length });
    const questions = await this.getQuestionsForRole(jobTitle, company, skills, jobDescription);
    console.log('Generated', questions.length, 'questions');

    const interview = await prisma.interview.create({
      data: {
        userId,
        jobTitle,
        company,
        questions: { items: questions }
      }
    });

    console.log('Interview saved to database with ID:', interview.id);
    return interview;
  }

  async getQuestionsForRole(jobTitle, company, skills, jobDescription = '') {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key') {
      console.log('Using template questions (no OpenAI API key)');
      return this.getTemplateQuestions(jobTitle, company, skills);
    }

    try {
      const skillsText = skills.length > 0 ? skills.join(', ') : 'general software development skills';
      const descText = jobDescription ? `\n\nJob Description: ${jobDescription.substring(0, 500)}` : '';
      const companyText = company ? ` at ${company}` : '';
      
      console.log('Calling OpenAI API for questions');
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert technical interviewer. Generate challenging but fair interview questions.'
            },
            {
              role: 'user',
              content: `Generate 15 interview questions for a ${jobTitle} position${companyText}. Skills required: ${skillsText}.${descText}
              
Include:
- 5 technical questions
- 5 behavioral questions
- 5 situational questions

Format as JSON array with objects containing: question, type, difficulty`
            }
          ],
          temperature: 0.8,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : this.getTemplateQuestions(jobTitle, company, skills);
    } catch (error) {
      console.error('OpenAI error:', error.message);
      return this.getTemplateQuestions(jobTitle, company, skills);
    }
  }

  getTemplateQuestions(jobTitle, company, skills) {
    const companyText = company ? ` at ${company}` : '';
    return [
      {
        question: "Tell me about yourself and your background.",
        type: "behavioral",
        difficulty: "easy"
      },
      {
        question: `What interests you about this ${jobTitle} position${companyText}?`,
        type: "behavioral",
        difficulty: "easy"
      },
      {
        question: company ? `Why do you want to work at ${company}?` : "Why are you interested in this company?",
        type: "behavioral",
        difficulty: "easy"
      },
      {
        question: "Describe a challenging project you've worked on.",
        type: "behavioral",
        difficulty: "medium"
      },
      {
        question: "How do you handle tight deadlines and pressure?",
        type: "behavioral",
        difficulty: "medium"
      },
      {
        question: "Where do you see yourself in 5 years?",
        type: "behavioral",
        difficulty: "easy"
      },
      {
        question: `Explain your experience with ${skills[0] || 'relevant technologies'}.`,
        type: "technical",
        difficulty: "medium"
      },
      {
        question: "How do you stay updated with industry trends?",
        type: "technical",
        difficulty: "easy"
      },
      {
        question: "Describe your approach to debugging complex issues.",
        type: "technical",
        difficulty: "medium"
      },
      {
        question: "What's your experience with version control systems?",
        type: "technical",
        difficulty: "easy"
      },
      {
        question: "How would you optimize application performance?",
        type: "technical",
        difficulty: "hard"
      },
      {
        question: "If you disagreed with a team decision, how would you handle it?",
        type: "situational",
        difficulty: "medium"
      },
      {
        question: "How would you handle a project with unclear requirements?",
        type: "situational",
        difficulty: "medium"
      },
      {
        question: "Describe a time you had to learn a new technology quickly.",
        type: "situational",
        difficulty: "medium"
      },
      {
        question: "How do you prioritize tasks when everything is urgent?",
        type: "situational",
        difficulty: "hard"
      },
      {
        question: "What would you do if you made a critical mistake in production?",
        type: "situational",
        difficulty: "hard"
      }
    ];
  }

  async submitAnswers(interviewId, userId, answers) {
    const interview = await prisma.interview.findFirst({
      where: { id: interviewId, userId }
    });

    if (!interview) {
      throw new Error('Interview not found');
    }

    const score = await this.evaluateAnswers(interview.questions.items, answers);

    const updatedInterview = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        answers: { items: answers },
        score: score.totalScore,
        feedback: score.feedback
      }
    });

    return updatedInterview;
  }

  async evaluateAnswers(questions, answers) {
    let totalScore = 0;
    const feedback = [];

    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      const question = questions[i];
      
      let score = 0;
      const wordCount = answer.answer.split(' ').length;

      if (wordCount < 20) {
        score = 40;
        feedback.push({
          question: question.question,
          feedback: "Answer is too brief. Provide more details and examples."
        });
      } else if (wordCount < 50) {
        score = 60;
        feedback.push({
          question: question.question,
          feedback: "Good start. Add specific examples to strengthen your answer."
        });
      } else if (wordCount < 100) {
        score = 80;
        feedback.push({
          question: question.question,
          feedback: "Well-structured answer. Good use of examples."
        });
      } else {
        score = 95;
        feedback.push({
          question: question.question,
          feedback: "Excellent, comprehensive answer with strong examples."
        });
      }

      totalScore += score;
    }

    return {
      totalScore: Math.round(totalScore / answers.length),
      feedback
    };
  }

  async getInterviewHistory(userId) {
    const interviews = await prisma.interview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        jobTitle: true,
        company: true,
        score: true,
        createdAt: true
      }
    });

    return interviews;
  }

  async getInterviewById(interviewId, userId) {
    const interview = await prisma.interview.findFirst({
      where: { id: interviewId, userId }
    });

    if (!interview) {
      throw new Error('Interview not found');
    }

    return interview;
  }

  async deleteInterview(interviewId, userId) {
    const interview = await prisma.interview.findFirst({
      where: { id: interviewId, userId }
    });

    if (!interview) {
      throw new Error('Interview not found');
    }

    await prisma.interview.delete({
      where: { id: interviewId }
    });

    return { message: 'Interview deleted successfully' };
  }
}

module.exports = new InterviewService();
