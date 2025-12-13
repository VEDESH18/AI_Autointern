'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import useApplicationStore from '@/store/applicationStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { stats, fetchStats } = useApplicationStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchStats();
  }, [isAuthenticated]);

  const statusData = [
    { name: 'Success', value: stats?.success || 0, color: '#22c55e' },
    { name: 'Pending', value: stats?.pending || 0, color: '#f59e0b' },
    { name: 'Failed', value: stats?.failed || 0, color: '#ef4444' }
  ];

  const weeklyData = [
    { day: 'Mon', applications: 5, success: 2 },
    { day: 'Tue', applications: 8, success: 3 },
    { day: 'Wed', applications: 6, success: 4 },
    { day: 'Thu', applications: 10, success: 5 },
    { day: 'Fri', applications: 7, success: 3 },
    { day: 'Sat', applications: 4, success: 2 },
    { day: 'Sun', applications: 3, success: 1 }
  ];

  const successRate = stats?.total ? ((stats.success / stats.total) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Analytics Dashboard 📊</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track your application performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="dark:bg-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="dark:text-gray-400">Success Rate</CardDescription>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <CardTitle className="text-4xl text-green-600">{successRate}%</CardTitle>
          </CardHeader>
        </Card>

        <Card className="dark:bg-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="dark:text-gray-400">Total Applications</CardDescription>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <CardTitle className="text-4xl text-blue-600">{stats?.total || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="dark:bg-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="dark:text-gray-400">Pending</CardDescription>
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <CardTitle className="text-4xl text-orange-600">{stats?.pending || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="dark:bg-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="dark:text-gray-400">Failed</CardDescription>
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <CardTitle className="text-4xl text-red-600">{stats?.failed || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution */}
        <Card className="dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Application Status</CardTitle>
            <CardDescription className="dark:text-gray-400">Distribution of your applications</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card className="dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Weekly Performance</CardTitle>
            <CardDescription className="dark:text-gray-400">Applications vs Success Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="success" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daily Applications */}
      <Card className="dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Daily Applications</CardTitle>
          <CardDescription className="dark:text-gray-400">Your application activity over the week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="applications" fill="#3b82f6" />
              <Bar dataKey="success" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
