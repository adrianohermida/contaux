/**
 * AutomationDashboard Component
 * Automation metrics and performance dashboard
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Zap, TrendingUp, CheckCircle } from 'lucide-react';

export default function AutomationDashboard() {
  const [automationStats] = useState({
    totalWorkflows: 12,
    activeWorkflows: 10,
    pausedWorkflows: 2,
    successRate: 99.7,
    tasksAutomated: 2845,
    hoursLast30Days: 189,
  });

  const [executionData] = useState([
    { day: 'Mon', successful: 234, failed: 2 },
    { day: 'Tue', successful: 245, failed: 1 },
    { day: 'Wed', successful: 198, failed: 3 },
    { day: 'Thu', successful: 267, failed: 1 },
    { day: 'Fri', successful: 289, failed: 2 },
    { day: 'Sat', successful: 145, failed: 0 },
    { day: 'Sun', successful: 156, failed: 1 },
  ]);

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Automation Dashboard</h2>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900">
          {automationStats.successRate}% Success
        </Badge>
      </div>

      {/* Automation Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Workflows</p>
            <p className="text-2xl font-bold dark:text-slate-100">
              {automationStats.totalWorkflows}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Active</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {automationStats.activeWorkflows}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Tasks Automated</p>
            <p className="text-2xl font-bold dark:text-slate-100">
              {automationStats.tasksAutomated.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">Hours Saved (30d)</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {automationStats.hoursLast30Days}h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Execution Trends */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <TrendingUp className="w-4 h-4" />
            Weekly Execution Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={executionData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="successful" fill="#10b981" name="Successful" />
              <Bar dataKey="failed" fill="#ef4444" name="Failed" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <CheckCircle className="w-4 h-4" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Average Execution Time: 2.4s
            </p>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Total Automations Run: 28,450
            </p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Cost Savings: $4,500+ (estimated)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}