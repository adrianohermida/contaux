/**
 * AutomationDashboard Component
 * View and manage workflow automations
 */

import React, { useState } from 'react';
import { useWorkflowBuilder } from '../hooks/useWorkflowBuilder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Play, Trash2, Edit2, Activity, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import WorkflowBuilder from './WorkflowBuilder';

export default function AutomationDashboard({ workspaceId }) {
  const { workflows, createWorkflow, deleteWorkflow, executeWorkflow } = useWorkflowBuilder(
    workspaceId
  );
  const [showBuilder, setShowBuilder] = useState(false);
  const [executing, setExecuting] = useState(null);

  const handleExecuteWorkflow = async (workflowId) => {
    setExecuting(workflowId);
    try {
      await executeWorkflow(workflowId);
    } finally {
      setExecuting(null);
    }
  };

  const getSuccessRate = (workflow) => {
    if (workflow.execution_count === 0) return 0;
    return Math.round((workflow.success_count / workflow.execution_count) * 100);
  };

  return (
    <div className="space-y-6 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Automation Dashboard</h2>
        <Button
          onClick={() => setShowBuilder(true)}
          className="gap-2 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          Create Workflow
        </Button>
      </div>

      {/* Builder Modal */}
      {showBuilder && (
        <WorkflowBuilder
          workspaceId={workspaceId}
          onClose={() => setShowBuilder(false)}
        />
      )}

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Workflows</p>
                <p className="text-3xl font-bold dark:text-slate-100">{workflows.length}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {workflows.filter((w) => w.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Executions</p>
                <p className="text-3xl font-bold dark:text-slate-100">
                  {workflows.reduce((sum, w) => sum + (w.execution_count || 0), 0)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Success Rate</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {workflows.length > 0
                    ? Math.round(
                        workflows.reduce((sum, w) => sum + getSuccessRate(w), 0) /
                          workflows.length
                      )
                    : 0}
                  %
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows List */}
      {workflows.length === 0 ? (
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-12 pb-12 text-center">
            <Activity className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No workflows yet</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
              Create your first workflow to start automating tasks
            </p>
            <Button
              onClick={() => setShowBuilder(true)}
              className="mt-4 gap-2 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              Create Workflow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="dark:bg-slate-800 dark:border-slate-700 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="dark:text-slate-100">{workflow.name}</CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Trigger: <strong>{workflow.trigger_type}</strong>
                    </p>
                  </div>
                  <Badge
                    className={
                      workflow.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                    }
                  >
                    {workflow.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Actions */}
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Actions ({workflow.actions?.length || 0})
                  </p>
                  <div className="space-y-1">
                    {workflow.actions?.map((action, idx) => (
                      <div key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        {typeof action === 'string' ? action : action.type}
                      </div>
                    )) || (
                      <p className="text-sm text-slate-500 dark:text-slate-400">No actions configured</p>
                    )}
                  </div>
                </div>

                {/* Execution Stats */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Executions</p>
                    <p className="text-lg font-bold dark:text-slate-100">
                      {workflow.execution_count || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Success</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {workflow.success_count || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Errors</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                      {workflow.error_count || 0}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end pt-2 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExecuteWorkflow(workflow.id)}
                    disabled={executing === workflow.id}
                    className="gap-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <Play className="w-4 h-4" />
                    {executing === workflow.id ? 'Running...' : 'Execute'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteWorkflow(workflow.id)}
                    className="gap-2 text-red-500 dark:border-slate-600 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}