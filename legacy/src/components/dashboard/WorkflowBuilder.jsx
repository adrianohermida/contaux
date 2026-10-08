/**
 * WorkflowBuilder Component
 * Workflow creation and management interface
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Play, Edit2 } from 'lucide-react';

export default function WorkflowBuilder() {
  const [workflows] = useState([
    {
      id: 'wf_001',
      name: 'Send Invoice Reminder',
      trigger: 'schedule_daily',
      steps: 4,
      status: 'active',
      executions: 156,
      successRate: 99.8,
    },
    {
      id: 'wf_002',
      name: 'Update Customer Status',
      trigger: 'entity_update',
      steps: 3,
      status: 'active',
      executions: 89,
      successRate: 100,
    },
    {
      id: 'wf_003',
      name: 'Generate Monthly Report',
      trigger: 'schedule_monthly',
      steps: 5,
      status: 'paused',
      executions: 12,
      successRate: 95.2,
    },
  ]);

  const getStatusColor = (status) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800 dark:bg-green-900'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900';
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Workflow Builder</h2>
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900">
          {workflows.length} Workflows
        </Badge>
      </div>

      {/* Workflows List */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base dark:text-slate-100">
            <Zap className="w-4 h-4" />
            Active Workflows
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{workflow.name}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Trigger: {workflow.trigger}
                  </p>
                </div>
                <Badge className={getStatusColor(workflow.status)}>
                  {workflow.status.toUpperCase()}
                </Badge>
              </div>

              <div className="flex justify-between items-center mb-3">
                <div className="flex gap-4 text-xs">
                  <span className="text-slate-600 dark:text-slate-400">
                    {workflow.steps} steps
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {workflow.executions} executions
                  </span>
                  <span className="text-green-600 dark:text-green-400">
                    {workflow.successRate}% success
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  <Play className="w-3 h-3 mr-1" />
                  Execute
                </Button>
                <Button size="sm" className="bg-gray-600 hover:bg-gray-700 text-white text-xs">
                  <Edit2 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Create Workflow */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base dark:text-slate-100">Create New Workflow</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">New Workflow</Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white">From Template</Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">Import Workflow</Button>
        </CardContent>
      </Card>
    </div>
  );
}