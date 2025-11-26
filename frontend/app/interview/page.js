'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/utils/api';
import useAuthStore from '@/store/authStore';

export default function InterviewPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    jobDescription: ''
  });
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [answers, setAnswers] = useState({});
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchInterviews();
  }, [isAuthenticated]);

  const fetchInterviews = async () => {
    try {
      const response = await api.get('/interview');
      setInterviews(response.data);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const response = await api.post('/interview/generate', formData);
      alert('Interview questions generated successfully!');
      setFormData({ jobTitle: '', company: '', jobDescription: '' });
      fetchInterviews();
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions: ' + (error.response?.data?.message || error.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleEvaluate = async (interviewId) => {
    setEvaluating(true);
    try {
      const response = await api.post(`/interview/${interviewId}/evaluate`, {
        answers: answers[interviewId] || {}
      });
      setEvaluation(response.data);
      alert('Answers evaluated! Check the feedback below.');
    } catch (error) {
      console.error('Error evaluating answers:', error);
      alert('Failed to evaluate answers');
    } finally {
      setEvaluating(false);
    }
  };

  const handleAnswerChange = (interviewId, questionIndex, value) => {
    setAnswers({
      ...answers,
      [interviewId]: {
        ...(answers[interviewId] || {}),
        [questionIndex]: value
      }
    });
  };

  const handleDelete = async (interviewId) => {
    if (!confirm('Are you sure you want to delete this interview prep?')) return;
    try {
      await api.delete(`/interview/${interviewId}`);
      alert('Interview deleted successfully!');
      fetchInterviews();
      if (selectedInterview?.id === interviewId) {
        setSelectedInterview(null);
      }
    } catch (error) {
      console.error('Error deleting interview:', error);
      alert('Failed to delete interview');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Preparation</h1>
          <p className="text-gray-600">Practice with AI-generated interview questions</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Generate Questions Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Generate Questions</CardTitle>
                <CardDescription>Create interview questions for a specific job</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Job Title *</label>
                    <Input
                      required
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Company *</label>
                    <Input
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g., Google"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Job Description</label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md"
                      rows="6"
                      value={formData.jobDescription}
                      onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                      placeholder="Paste the job description here..."
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={generating}>
                    {generating ? 'Generating...' : '✨ Generate Questions'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Interview List */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Your Interviews ({interviews.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {interviews.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No interviews yet</p>
                ) : (
                  <div className="space-y-2">
                    {interviews.map((interview) => (
                      <div
                        key={interview.id}
                        className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                          selectedInterview?.id === interview.id ? 'bg-blue-50 border-blue-500' : ''
                        }`}
                        onClick={() => setSelectedInterview(interview)}
                      >
                        <p className="font-medium">{interview.jobTitle}</p>
                        <p className="text-sm text-gray-600">{interview.company}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {interview.questions?.length || 0} questions
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Interview Practice */}
          <div className="lg:col-span-2">
            {!selectedInterview ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  <p className="mb-2">Select an interview to practice</p>
                  <p className="text-sm">Or generate new questions using the form</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedInterview.jobTitle}</CardTitle>
                      <CardDescription>{selectedInterview.company}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEvaluate(selectedInterview.id)}
                        disabled={evaluating}
                      >
                        {evaluating ? 'Evaluating...' : '📊 Evaluate Answers'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(selectedInterview.id)}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {selectedInterview.questions?.map((question, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="font-bold text-blue-600">Q{index + 1}:</span>
                          <p className="font-medium">{question}</p>
                        </div>
                        <textarea
                          className="w-full px-3 py-2 border rounded-md mt-2"
                          rows="4"
                          placeholder="Type your answer here..."
                          value={answers[selectedInterview.id]?.[index] || ''}
                          onChange={(e) => handleAnswerChange(selectedInterview.id, index, e.target.value)}
                        />
                      </div>
                    ))}

                    {selectedInterview.questions?.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No questions generated yet</p>
                    )}
                  </div>

                  {/* Evaluation Results */}
                  {evaluation && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold mb-2">Evaluation Results</h3>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">Overall Score:</span> {evaluation.overallScore}/10
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Strengths:</span> {evaluation.strengths?.join(', ') || 'N/A'}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Areas to Improve:</span> {evaluation.improvements?.join(', ') || 'N/A'}
                        </p>
                        {evaluation.feedback && (
                          <div className="mt-3 p-3 bg-white rounded">
                            <p className="text-sm font-medium mb-1">Detailed Feedback:</p>
                            <p className="text-sm text-gray-700">{evaluation.feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Interview Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded">
                <h4 className="font-semibold mb-2">🎯 Be Specific</h4>
                <p className="text-sm text-gray-700">Use concrete examples from your experience with numbers and results</p>
              </div>
              <div className="p-4 bg-green-50 rounded">
                <h4 className="font-semibold mb-2">📚 STAR Method</h4>
                <p className="text-sm text-gray-700">Structure answers: Situation, Task, Action, Result</p>
              </div>
              <div className="p-4 bg-purple-50 rounded">
                <h4 className="font-semibold mb-2">❓ Ask Questions</h4>
                <p className="text-sm text-gray-700">Prepare thoughtful questions about the role and company</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
