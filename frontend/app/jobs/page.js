'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/utils/api';
import useAuthStore from '@/store/authStore';
import useJobStore from '@/store/jobStore';

export default function JobsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { jobs, fetchJobs, scrapeJob } = useJobStore();
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [scrapeForm, setScrapeForm] = useState({
    url: '',
    platform: 'linkedin'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadJobs();
  }, [isAuthenticated]);

  const loadJobs = async () => {
    setLoading(true);
    await fetchJobs();
    setLoading(false);
  };

  const handleScrape = async (e) => {
    e.preventDefault();
    if (!scrapeForm.url) {
      alert('Please enter a job URL');
      return;
    }

    setScraping(true);
    try {
      await scrapeJob(scrapeForm.url, scrapeForm.platform);
      alert('Job scraped successfully!');
      setScrapeForm({ url: '', platform: 'linkedin' });
      loadJobs();
    } catch (error) {
      console.error('Error scraping job:', error);
      alert('Failed to scrape job: ' + (error.response?.data?.message || error.message));
    } finally {
      setScraping(false);
    }
  };

  const handleApply = async (jobId) => {
    try {
      await api.post('/apply/start', { jobId });
      alert('Application started! Check your applications dashboard for status.');
    } catch (error) {
      console.error('Error applying to job:', error);
      alert('Failed to start application: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSaveJob = async (jobId) => {
    try {
      // This would typically update the job in the database
      alert('Job saved! (Feature to be implemented)');
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchQuery || 
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = !locationQuery || 
      job.location?.toLowerCase().includes(locationQuery.toLowerCase());
    
    const matchesPlatform = platformFilter === 'all' || job.platform === platformFilter;

    return matchesSearch && matchesLocation && matchesPlatform;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Search</h1>
          <p className="text-gray-600">Browse and apply to jobs from multiple platforms</p>
        </div>

        {/* Scrape Job Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Scrape New Job</CardTitle>
            <CardDescription>Add a job from LinkedIn, Indeed, or Glassdoor</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleScrape} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Paste job URL here..."
                  value={scrapeForm.url}
                  onChange={(e) => setScrapeForm({ ...scrapeForm, url: e.target.value })}
                />
              </div>
              <select
                className="px-4 py-2 border rounded-md"
                value={scrapeForm.platform}
                onChange={(e) => setScrapeForm({ ...scrapeForm, platform: e.target.value })}
              >
                <option value="linkedin">LinkedIn</option>
                <option value="indeed">Indeed</option>
                <option value="glassdoor">Glassdoor</option>
              </select>
              <Button type="submit" disabled={scraping}>
                {scraping ? 'Scraping...' : '🔍 Scrape Job'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search by title, company, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <Input
                  placeholder="Location..."
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                />
              </div>
              <div>
                <select
                  className="w-full px-4 py-2 border rounded-md"
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                >
                  <option value="all">All Platforms</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="indeed">Indeed</option>
                  <option value="glassdoor">Glassdoor</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
          <Button onClick={loadJobs} variant="outline" size="sm">
            🔄 Refresh
          </Button>
        </div>

        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <p className="mb-2">No jobs found</p>
              <p className="text-sm">Try adjusting your filters or scrape a new job</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-medium">{job.company}</span>
                        {job.location && <span>📍 {job.location}</span>}
                        {job.salary && <span>💰 {job.salary}</span>}
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs uppercase">
                          {job.platform}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleApply(job._id)}>
                        ✉️ Apply
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleSaveJob(job._id)}>
                        ⭐ Save
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {job.description && (
                      <div>
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {job.description}
                        </p>
                      </div>
                    )}
                    
                    {job.requirements && job.requirements.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Requirements:</p>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.slice(0, 5).map((req, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {req}
                            </span>
                          ))}
                          {job.requirements.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              +{job.requirements.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="text-xs text-gray-500">
                        Posted: {new Date(job.postedDate || job.scrapedAt).toLocaleDateString()}
                      </div>
                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View Original →
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
