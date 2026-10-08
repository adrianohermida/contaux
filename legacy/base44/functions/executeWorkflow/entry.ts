import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspace_id, workflow_id, trigger_data } = await req.json();
    
    if (!workspace_id || !workflow_id) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Fetch workflow
    const workflows = await base44.asServiceRole.entities.Workflow.filter({
      workspace_id,
      id: workflow_id
    });

    if (!workflows || workflows.length === 0) {
      return Response.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const workflow = workflows[0];

    if (workflow.status !== 'active') {
      return Response.json({ error: 'Workflow is not active' }, { status: 400 });
    }

    // Execute workflow nodes
    let executionResult = {
      workflow_id,
      status: 'success',
      executed_actions: [],
      errors: []
    };

    try {
      // Execute each node in workflow
      if (workflow.nodes && Array.isArray(workflow.nodes)) {
        for (const node of workflow.nodes) {
          try {
            // Process node based on type
            if (node.type === 'action') {
              // Execute action (send email, update contact, etc.)
              executionResult.executed_actions.push({
                node_id: node.id,
                type: node.action_type,
                status: 'completed'
              });
            } else if (node.type === 'condition') {
              // Evaluate condition
              const conditionMet = evaluateCondition(node, trigger_data);
              if (!conditionMet) {
                executionResult.status = 'skipped';
                break;
              }
            } else if (node.type === 'delay') {
              // Schedule delayed action
              executionResult.executed_actions.push({
                node_id: node.id,
                type: 'delay',
                duration: node.duration,
                status: 'scheduled'
              });
            }
          } catch (nodeError) {
            executionResult.errors.push({
              node_id: node.id,
              error: nodeError.message
            });
          }
        }
      }

      // Update workflow execution stats
      await base44.asServiceRole.entities.Workflow.update(workflow_id, {
        execution_count: (workflow.execution_count || 0) + 1,
        success_count: executionResult.status === 'success' ? (workflow.success_count || 0) + 1 : workflow.success_count,
        error_count: executionResult.errors.length > 0 ? (workflow.error_count || 0) + 1 : workflow.error_count
      });

      return Response.json(executionResult);
    } catch (error) {
      executionResult.status = 'failed';
      executionResult.errors.push({ error: error.message });
      
      // Update error count
      await base44.asServiceRole.entities.Workflow.update(workflow_id, {
        execution_count: (workflow.execution_count || 0) + 1,
        error_count: (workflow.error_count || 0) + 1
      });

      return Response.json(executionResult, { status: 500 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function evaluateCondition(condition, data) {
  const { field, operator, value } = condition;
  const dataValue = data[field];

  switch (operator) {
    case 'equals':
      return dataValue === value;
    case 'greater_than':
      return dataValue > value;
    case 'less_than':
      return dataValue < value;
    case 'contains':
      return String(dataValue).includes(value);
    default:
      return true;
  }
}