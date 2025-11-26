'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useApplicationStore } from '@/store/applicationStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function Dashboard() {
  const router = useRouter()
  const { user, isAuthenticated, checkAuth } = useAuthStore()
  const { applications, stats, fetchApplications, fetchStats } = useApplicationStore()

  useEffect(() => {
    checkAuth()
    if (!isAuthenticated) {
      router.push('/login')
    } else {
      fetchApplications()
      fetchStats()
    }
  }, [isAuthenticated])

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  const chartData = [
    { name: 'Success', value: stats?.success || 0, color: '#22c55e' },
    { name: 'Pending', value: stats?.pending || 0, color: '#f59e0b' },
    { name: 'Failed', value: stats?.failed || 0, color: '#ef4444' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="text-2xl font-bold text-blue-600">AutoApply+Prep</div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.firstName}</span>
              <Button variant="outline" onClick={() => router.push('/jobs')}>
                Jobs
              </Button>
              <Button variant="outline" onClick={() => router.push('/resume')}>
                Resume
              </Button>
              <Button variant="outline" onClick={() => router.push('/interview')}>
                Interview Prep
              </Button>
              <Button variant="ghost" onClick={() => useAuthStore.getState().logout()}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Applications</CardDescription>
              <CardTitle className="text-4xl">{stats?.total || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Successful</CardDescription>
              <CardTitle className="text-4xl text-green-600">{stats?.success || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-4xl text-yellow-600">{stats?.pending || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Success Rate</CardDescription>
              <CardTitle className="text-4xl text-blue-600">{stats?.successRate || 0}%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.recentApplications?.slice(0, 5).map((app) => (
                  <div key={app.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{app.jobTitle}</p>
                      <p className="text-sm text-gray-600">{app.company}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm ${
                      app.status === 'success' ? 'bg-green-100 text-green-800' :
                      app.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition" onClick={() => router.push('/jobs/scrape')}>
            <CardHeader>
              <CardTitle>Scrape New Job</CardTitle>
              <CardDescription>Add job postings to track</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start Scraping</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition" onClick={() => router.push('/apply')}>
            <CardHeader>
              <CardTitle>Auto Apply</CardTitle>
              <CardDescription>Submit applications automatically</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start Applying</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition" onClick={() => router.push('/interview')}>
            <CardHeader>
              <CardTitle>Interview Prep</CardTitle>
              <CardDescription>Practice interview questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start Practice</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
