import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspace_id, opportunity_id } = await req.json();
    
    if (!workspace_id) {
      return Response.json({ error: 'Missing workspace_id' }, { status: 400 });
    }

    // Fetch opportunities
    const query = opportunity_id 
      ? { workspace_id, id: opportunity_id }
      : { workspace_id };
    
    const opportunities = await base44.asServiceRole.entities.SalesOpportunity.filter(query);
    
    if (!opportunities || opportunities.length === 0) {
      return Response.json({ recommendations: [] });
    }

    // Fetch activities for context
    const activities = await base44.asServiceRole.entities.SalesActivity.filter({ workspace_id });
    
    // Generate recommendations
    const recommendations = opportunities.map(opp => {
      const oppActivities = activities.filter(a => a.opportunity_id === opp.id);
      const lastActivity = oppActivities.length > 0 
        ? new Date(Math.max(...oppActivities.map(a => new Date(a.created_date))))
        : null;
      
      const daysInactive = lastActivity 
        ? Math.floor((Date.now() - lastActivity) / (1000 * 60 * 60 * 24))
        : Math.floor((Date.now() - new Date(opp.created_date)) / (1000 * 60 * 60 * 24));
      
      const leadScore = opp.lead_score || 0;
      const stageProgression = ['prospect', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
      const currentStageIndex = stageProgression.indexOf(opp.pipeline_stage);
      
      // Decision logic
      let actionType = 'email';
      let priority = 3;
      let reason = 'Regular follow-up';
      let dueDate = new Date();
      
      // Hot lead with inactivity
      if (leadScore >= 70 && daysInactive > 5) {
        actionType = 'call';
        priority = 5;
        reason = `Hot lead (score: ${leadScore}) inactive for ${daysInactive} days`;
        dueDate.setDate(dueDate.getDate() + 1);
      }
      // High scoring + stuck stage
      else if (leadScore >= 70 && currentStageIndex >= 2 && daysInactive > 10) {
        actionType = 'proposal';
        priority = 5;
        reason = `Send proposal - in ${opp.pipeline_stage} stage for ${daysInactive} days`;
        dueDate.setDate(dueDate.getDate() + 2);
      }
      // Low score + old deal
      else if (leadScore < 30 && daysInactive > 30) {
        actionType = 'email';
        priority = 2;
        reason = `Cold lead (score: ${leadScore}) - consider re-qualifying`;
        dueDate.setDate(dueDate.getDate() + 7);
      }
      // Won deals - follow up opportunity
      else if (opp.pipeline_stage === 'won') {
        actionType = 'email';
        priority = 3;
        reason = 'Follow-up for upsell/cross-sell opportunity';
        dueDate.setDate(dueDate.getDate() + 14);
      }
      // Regular cadence
      else {
        const cadenceDays = leadScore >= 70 ? 3 : leadScore >= 30 ? 7 : 14;
        actionType = leadScore >= 50 ? 'call' : 'email';
        priority = Math.ceil(leadScore / 20);
        reason = `Regular ${actionType} follow-up`;
        dueDate.setDate(dueDate.getDate() + cadenceDays);
      }

      return {
        opportunity_id: opp.id,
        lead_name: opp.opportunity_name,
        action_type: actionType,
        priority,
        due_date: dueDate.toISOString().split('T')[0],
        reason,
        suggested_content: generateSuggestedContent(actionType, opp, leadScore),
        success_probability: Math.min((leadScore + 10) / 100, 0.95)
      };
    });

    return Response.json({ recommendations });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateSuggestedContent(actionType, opp, leadScore) {
  const templates = {
    call: `Hi ${opp.opportunity_name}, following up on our ${opp.pipeline_stage} opportunity. Do you have 15 mins to discuss?`,
    email: `Hello,\n\nI wanted to check in on our ${opp.pipeline_stage} opportunity worth ${opp.deal_value}.\n\nBest regards`,
    meeting: `Let's schedule a meeting to discuss the proposal and next steps for ${opp.opportunity_name}.`,
    proposal: `Based on our discussions, I've prepared a proposal for your review. Can we schedule a call this week?`
  };
  
  return templates[actionType] || templates.email;
}