'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/utils/api';
import useAuthStore from '@/store/authStore';

export default function ResumePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    experience: '',
    education: '',
    skills: '',
    certifications: '',
    languages: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchResumes();
  }, [isAuthenticated]);

  const fetchResumes = async () => {
    try {
      const response = await api.get('/resume');
      setResumes(response.data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      // Parse arrays from comma-separated strings
      const payload = {
        ...formData,
        experience: formData.experience ? formData.experience.split('\n').map(item => item.trim()).filter(Boolean) : [],
        education: formData.education ? formData.education.split('\n').map(item => item.trim()).filter(Boolean) : [],
        skills: formData.skills ? formData.skills.split(',').map(item => item.trim()).filter(Boolean) : [],
        certifications: formData.certifications ? formData.certifications.split(',').map(item => item.trim()).filter(Boolean) : [],
        languages: formData.languages ? formData.languages.split(',').map(item => item.trim()).filter(Boolean) : []
      };

      await api.post('/resume', payload);
      alert('Resume created successfully!');
      setFormData({
        title: '',
        fullName: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
        experience: '',
        education: '',
        skills: '',
        certifications: '',
        languages: ''
      });
      fetchResumes();
    } catch (error) {
      console.error('Error creating resume:', error);
      alert('Failed to create resume: ' + (error.response?.data?.message || error.message));
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (resumeId) => {
    try {
      const response = await api.get(`/resume/${resumeId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume-${resumeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume');
    }
  };

  const handleDelete = async (resumeId) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await api.delete(`/resume/${resumeId}`);
      alert('Resume deleted successfully!');
      fetchResumes();
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume');
    }
  };

  const handleTailor = async (resumeId) => {
    const jobDescription = prompt('Enter the job description to tailor this resume:');
    if (!jobDescription) return;

    try {
      const response = await api.post(`/resume/${resumeId}/tailor`, { jobDescription });
      alert('Resume tailored successfully! Suggestions:\n\n' + JSON.stringify(response.data.suggestions, null, 2));
    } catch (error) {
      console.error('Error tailoring resume:', error);
      alert('Failed to tailor resume');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resumes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Builder</h1>
          <p className="text-gray-600">Create and manage your professional resumes</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Create Resume Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Create New Resume</CardTitle>
                <CardDescription>Fill in your details to generate a professional resume</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Resume Title *</label>
                    <Input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Software Engineer Resume"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <Input
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Phone *</label>
                    <Input
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="San Francisco, CA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Professional Summary</label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md"
                      rows="3"
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      placeholder="Brief professional summary..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Experience (one per line)</label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md"
                      rows="4"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="Senior Developer at Company (2020-2023)&#10;Junior Developer at StartUp (2018-2020)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Education (one per line)</label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md"
                      rows="3"
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      placeholder="BS Computer Science, University (2018)&#10;AWS Certified Developer (2021)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Skills (comma-separated)</label>
                    <Input
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      placeholder="JavaScript, React, Node.js, Python"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Certifications (comma-separated)</label>
                    <Input
                      value={formData.certifications}
                      onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                      placeholder="AWS Certified, PMP"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Languages (comma-separated)</label>
                    <Input
                      value={formData.languages}
                      onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                      placeholder="English, Spanish"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={creating}>
                    {creating ? 'Creating...' : 'Create Resume'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Resumes List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Resumes ({resumes.length})</CardTitle>
                <CardDescription>Manage and download your created resumes</CardDescription>
              </CardHeader>
              <CardContent>
                {resumes.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="mb-2">No resumes yet</p>
                    <p className="text-sm">Create your first resume using the form</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {resumes.map((resume) => (
                      <div key={resume.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{resume.title}</h3>
                            <p className="text-sm text-gray-600">{resume.fullName}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Created: {new Date(resume.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleDownload(resume.id)}>
                              📄 Download
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleTailor(resume.id)}>
                              ✨ Tailor
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(resume.id)}>
                              🗑️
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                          <div>
                            <span className="text-gray-600">Email:</span> {resume.email}
                          </div>
                          <div>
                            <span className="text-gray-600">Phone:</span> {resume.phone}
                          </div>
                          {resume.location && (
                            <div>
                              <span className="text-gray-600">Location:</span> {resume.location}
                            </div>
                          )}
                          {resume.skills && resume.skills.length > 0 && (
                            <div className="col-span-2">
                              <span className="text-gray-600">Skills:</span> {resume.skills.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
