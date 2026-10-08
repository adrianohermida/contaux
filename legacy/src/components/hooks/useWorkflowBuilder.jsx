/**
 * useWorkflowBuilder Hook
 * Build and manage workflow automation rules
 */

import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useWorkflowBuilder(workspaceId) {
  const queryClient = useQueryClient();
  const [workflows, setWorkflows] = useState([]);

  // Fetch workflows
  const { data: storedWorkflows = [] } = useQuery({
    queryKey: ['workflows', workspaceId],
    queryFn: async () => {
      // In production, fetch from base44.entities.Workflow
      return [];
    },
    enabled: !!workspaceId,
  });

  // Create workflow mutation
  const createWorkflowMutation = useMutation({
    mutationFn: async (workflowData) => {
      // In production, save to base44.entities.Workflow
      const workflow = {
        id: Math.random().toString(36).substr(2, 9),
        workspace_id: workspaceId,
        ...workflowData,
        created_at: new Date().toISOString(),
        status: 'active',
        execution_count: 0,
        success_count: 0,
        error_count: 0,
      };
      return workflow;
    },
    onSuccess: (newWorkflow) => {
      setWorkflows((prev) => [...prev, newWorkflow]);
      queryClient.invalidateQueries({ queryKey: ['workflows', workspaceId] });
    },
  });

  // Update workflow mutation
  const updateWorkflowMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      // In production, update in base44.entities.Workflow
      return { id, ...data, updated_at: new Date().toISOString() };
    },
    onSuccess: (updated) => {
      setWorkflows((prev) =>
        prev.map((w) => (w.id === updated.id ? { ...w, ...updated } : w))
      );
      queryClient.invalidateQueries({ queryKey: ['workflows', workspaceId] });
    },
  });

  // Delete workflow mutation
  const deleteWorkflowMutation = useMutation({
    mutationFn: async (workflowId) => {
      // In production, delete from base44.entities.Workflow
      return workflowId;
    },
    onSuccess: (deletedId) => {
      setWorkflows((prev) => prev.filter((w) => w.id !== deletedId));
      queryClient.invalidateQueries({ queryKey: ['workflows', workspaceId] });
    },
  });

  // Create workflow
  const createWorkflow = useCallback(
    (name, trigger, actions, conditions = {}) => {
      createWorkflowMutation.mutate({
        name,
        trigger_type: trigger,
        trigger_config: trigger === 'manual' ? {} : { type: trigger },
        actions: Array.isArray(actions) ? actions : [actions],
        conditions,
        nodes: [
          { type: 'trigger', trigger },
          ...actions.map((action, idx) => ({
            type: 'action',
            id: `action-${idx}`,
            action: action.type,
            config: action.config || {},
          })),
        ],
      });
    },
    [createWorkflowMutation]
  );

  // Update workflow
  const updateWorkflow = useCallback(
    (workflowId, updates) => {
      updateWorkflowMutation.mutate({ id: workflowId, data: updates });
    },
    [updateWorkflowMutation]
  );

  // Delete workflow
  const deleteWorkflow = useCallback(
    (workflowId) => {
      deleteWorkflowMutation.mutate(workflowId);
    },
    [deleteWorkflowMutation]
  );

  // Execute workflow
  const executeWorkflow = useCallback(async (workflowId, context = {}) => {
    const workflow = workflows.find((w) => w.id === workflowId);
    if (!workflow) return null;

    try {
      // Execute workflow actions
      const results = await Promise.all(
        workflow.actions.map((action) => executeAction(action, context))
      );

      // Update success count
      updateWorkflow(workflowId, {
        execution_count: (workflow.execution_count || 0) + 1,
        success_count: (workflow.success_count || 0) + 1,
      });

      return { success: true, results };
    } catch (error) {
      // Update error count
      updateWorkflow(workflowId, {
        execution_count: (workflow.execution_count || 0) + 1,
        error_count: (workflow.error_count || 0) + 1,
      });

      return { success: false, error: error.message };
    }
  }, [workflows, updateWorkflow]);

  // Execute single action
  const executeAction = useCallback(async (action, context) => {
    switch (action.type) {
      case 'send-email':
        // Send email notification
        return { type: 'email', sent: true };

      case 'create-task':
        // Create task
        return { type: 'task', created: true };

      case 'update-field':
        // Update field
        return { type: 'update', updated: true };

      case 'add-tag':
        // Add tag
        return { type: 'tag', added: true };

      default:
        return { type: action.type, executed: true };
    }
  }, []);

  // Get available triggers
  const getAvailableTriggers = useCallback(() => {
    return [
      { id: 'contact-created', label: 'Contact Created' },
      { id: 'contact-updated', label: 'Contact Updated' },
      { id: 'opportunity-created', label: 'Opportunity Created' },
      { id: 'opportunity-stage-changed', label: 'Opportunity Stage Changed' },
      { id: 'payment-received', label: 'Payment Received' },
      { id: 'scheduled', label: 'On Schedule' },
      { id: 'manual', label: 'Manual Trigger' },
    ];
  }, []);

  // Get available actions
  const getAvailableActions = useCallback(() => {
    return [
      { id: 'send-email', label: 'Send Email' },
      { id: 'send-notification', label: 'Send Notification' },
      { id: 'create-task', label: 'Create Task' },
      { id: 'update-field', label: 'Update Field' },
      { id: 'add-tag', label: 'Add Tag' },
      { id: 'create-opportunity', label: 'Create Opportunity' },
      { id: 'send-api-call', label: 'Send API Call' },
    ];
  }, []);

  return {
    workflows: workflows.length > 0 ? workflows : storedWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
    getAvailableTriggers,
    getAvailableActions,
    isLoading: createWorkflowMutation.isPending,
  };
}

export default useWorkflowBuilder;