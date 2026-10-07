/**
 * useWorkflowEngine Hook
 * Workflow automation and orchestration engine
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export function useWorkflowEngine(options = {}) {
  const { maxConcurrentWorkflows = 10 } = options;

  const [workflowState, setWorkflowState] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    completedWorkflows: 0,
    failedWorkflows: 0,
    successRate: 0,
  });

  const [automationMetrics, setAutomationMetrics] = useState({
    tasksAutomated: 0,
    timesSaved: 0,
    errorsReduced: 0,
  });

  const workflowsRef = useRef(new Map());
  const executionQueueRef = useRef([]);

  // Create workflow
  const createWorkflow = useCallback((config) => {
    const workflow = {
      id: `wf_${Date.now()}`,
      name: config.name,
      trigger: config.trigger,
      steps: config.steps || [],
      conditions: config.conditions || [],
      status: 'active',
      createdAt: Date.now(),
      executions: 0,
      lastExecution: null,
    };

    workflowsRef.current.set(workflow.id, workflow);

    setWorkflowState((prev) => ({
      ...prev,
      totalWorkflows: prev.totalWorkflows + 1,
    }));

    return workflow;
  }, []);

  // Execute workflow
  const executeWorkflow = useCallback((workflowId) => {
    const workflow = workflowsRef.current.get(workflowId);

    if (!workflow) {
      return null;
    }

    const execution = {
      id: `exec_${Date.now()}`,
      workflowId,
      startTime: Date.now(),
      status: 'running',
      steps: [],
    };

    executionQueueRef.current.push(execution);

    setWorkflowState((prev) => ({
      ...prev,
      activeWorkflows: Math.min(prev.activeWorkflows + 1, maxConcurrentWorkflows),
    }));

    // Simulate execution
    setTimeout(() => {
      execution.status = 'completed';
      execution.endTime = Date.now();
      execution.duration = execution.endTime - execution.startTime;

      workflow.executions++;
      workflow.lastExecution = new Date(execution.endTime);

      setWorkflowState((prev) => ({
        ...prev,
        activeWorkflows: Math.max(prev.activeWorkflows - 1, 0),
        completedWorkflows: prev.completedWorkflows + 1,
      }));
    }, Math.random() * 5000 + 1000);

    return execution;
  }, [maxConcurrentWorkflows]);

  // Get workflow
  const getWorkflow = useCallback((workflowId) => {
    return workflowsRef.current.get(workflowId);
  }, []);

  // Get all workflows
  const getAllWorkflows = useCallback(() => {
    return Array.from(workflowsRef.current.values());
  }, []);

  // Update workflow
  const updateWorkflow = useCallback((workflowId, updates) => {
    const workflow = workflowsRef.current.get(workflowId);

    if (!workflow) {
      return null;
    }

    Object.assign(workflow, updates);
    return workflow;
  }, []);

  // Delete workflow
  const deleteWorkflow = useCallback((workflowId) => {
    return workflowsRef.current.delete(workflowId);
  }, []);

  // Get execution history
  const getExecutionHistory = useCallback((workflowId, limit = 50) => {
    return executionQueueRef.current
      .filter((e) => e.workflowId === workflowId)
      .slice(-limit);
  }, []);

  // Monitor workflows
  useEffect(() => {
    const monitor = setInterval(() => {
      const workflows = getAllWorkflows();
      const total = workflows.length;
      const completed = workflows.filter((w) => w.executions > 0).length;

      if (total > 0) {
        setWorkflowState((prev) => ({
          ...prev,
          successRate: (completed / total) * 100,
        }));
      }
    }, 5000);

    return () => clearInterval(monitor);
  }, [getAllWorkflows]);

  return {
    workflowState,
    automationMetrics,
    createWorkflow,
    executeWorkflow,
    getWorkflow,
    getAllWorkflows,
    updateWorkflow,
    deleteWorkflow,
    getExecutionHistory,
  };
}

export default useWorkflowEngine;