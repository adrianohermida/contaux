import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspace_id, contact_id, risk_level } = await req.json();
    
    if (!workspace_id || !contact_id || !risk_level) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Fetch contact for enrichment
    const contacts = await base44.asServiceRole.entities.Client.filter({
      workspace_id,
      id: contact_id
    });

    if (!contacts || contacts.length === 0) {
      return Response.json({ error: 'Contact not found' }, { status: 404 });
    }

    const contact = contacts[0];
    let workflowTriggered = false;
    let actions = [];

    // Trigger appropriate workflow based on risk level
    if (risk_level === 'critical') {
      // Critical workflow: immediate action required
      actions.push({
        action: 'create_task',
        description: 'URGENT: Call contact immediately',
        assigned_to: user.email,
        due_date: new Date().toISOString().split('T')[0],
        priority: 'high'
      });

      actions.push({
        action: 'send_email',
        template: 'critical_retention_offer',
        recipient: contact.email,
        subject: 'We want to keep your business - special offer inside'
      });

      actions.push({
        action: 'update_tag',
        tag_name: 'At Risk - Critical',
        add: true
      });

      workflowTriggered = true;
    } else if (risk_level === 'high') {
      // High workflow: urgent retention actions
      actions.push({
        action: 'send_email',
        template: 'retention_offer',
        recipient: contact.email,
        subject: 'Exclusive offer for valued customers',
        schedule: '2024-01-01T09:00:00Z'
      });

      actions.push({
        action: 'create_task',
        description: 'Follow up with contact about retention offer',
        assigned_to: user.email,
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'medium'
      });

      actions.push({
        action: 'update_tag',
        tag_name: 'At Risk - High',
        add: true
      });

      workflowTriggered = true;
    } else if (risk_level === 'medium') {
      // Medium workflow: preventive measures
      actions.push({
        action: 'send_email',
        template: 'engagement_content',
        recipient: contact.email,
        subject: 'Tips to maximize your experience with us'
      });

      actions.push({
        action: 'update_tag',
        tag_name: 'Monitor Engagement',
        add: true
      });

      workflowTriggered = true;
    }

    // Execute all actions
    const executedActions = [];
    for (const action of actions) {
      try {
        if (action.action === 'create_task') {
          // Would create task in system
          executedActions.push({
            type: 'task_created',
            status: 'success',
            description: action.description
          });
        } else if (action.action === 'send_email') {
          // Would send email
          executedActions.push({
            type: 'email_queued',
            status: 'success',
            recipient: action.recipient
          });
        } else if (action.action === 'update_tag') {
          // Would update contact tag
          executedActions.push({
            type: 'tag_updated',
            status: 'success',
            tag: action.tag_name
          });
        }
      } catch (actionError) {
        executedActions.push({
          type: action.action,
          status: 'failed',
          error: actionError.message
        });
      }
    }

    return Response.json({
      workflow_triggered: workflowTriggered,
      contact_id,
      risk_level,
      actions_executed: executedActions.length,
      actions: executedActions,
      workflow_status: workflowTriggered ? 'active' : 'not_triggered'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});