'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AutoApply<span className="text-blue-600">+</span>Prep
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your AI-Powered Job Search Automation Platform
          </p>
          <p className="text-lg text-gray-500 mb-12">
            Automate job applications, generate tailored resumes & cover letters, 
            and prepare for interviews with AI-powered insights.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                Auto Apply
              </CardTitle>
              <CardDescription>
                Automatically apply to jobs on LinkedIn, Indeed, and Glassdoor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Smart job matching</li>
                <li>✓ One-click applications</li>
                <li>✓ Multi-platform support</li>
                <li>✓ Application tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📄</span>
                Resume Builder
              </CardTitle>
              <CardDescription>
                Create ATS-optimized resumes tailored to each job
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ AI-powered tailoring</li>
                <li>✓ ATS optimization</li>
                <li>✓ Multiple templates</li>
                <li>✓ PDF export</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">✉️</span>
                Cover Letters
              </CardTitle>
              <CardDescription>
                Generate personalized cover letters instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ AI-generated content</li>
                <li>✓ Job-specific customization</li>
                <li>✓ Professional templates</li>
                <li>✓ Quick editing</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🔍</span>
                Job Scraper
              </CardTitle>
              <CardDescription>
                Discover jobs from multiple platforms automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Real-time job scraping</li>
                <li>✓ Smart filtering</li>
                <li>✓ Save favorites</li>
                <li>✓ Daily updates</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Interview Prep
              </CardTitle>
              <CardDescription>
                Practice with AI-generated interview questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Company-specific questions</li>
                <li>✓ AI feedback on answers</li>
                <li>✓ Common questions bank</li>
                <li>✓ Practice tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Analytics
              </CardTitle>
              <CardDescription>
                Track your job search progress with insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Application analytics</li>
                <li>✓ Success rate tracking</li>
                <li>✓ Response insights</li>
                <li>✓ Performance metrics</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Sign Up</h3>
              <p className="text-sm text-gray-600">Create your free account in seconds</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Build Profile</h3>
              <p className="text-sm text-gray-600">Upload your resume and set preferences</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Auto Apply</h3>
              <p className="text-sm text-gray-600">Let AI apply to matching jobs automatically</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">4</span>
              </div>
              <h3 className="font-semibold mb-2">Get Hired</h3>
              <p className="text-sm text-gray-600">Track applications and prepare for interviews</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-blue-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Accelerate Your Job Search?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of job seekers who are landing their dream jobs faster
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-20 py-8 text-center text-gray-600">
        <p>&copy; 2025 AutoApply+Prep. All rights reserved.</p>
      </footer>
    </div>
  );
}
