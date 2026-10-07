import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspace_id, opportunity_id } = await req.json();
    
    if (!workspace_id || !opportunity_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch opportunity and related data
    const opportunity = await base44.asServiceRole.entities.SalesOpportunity.filter({
      workspace_id,
      id: opportunity_id
    });
    
    if (!opportunity || opportunity.length === 0) {
      return Response.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    const opp = opportunity[0];
    const activities = await base44.asServiceRole.entities.SalesActivity.filter({
      workspace_id,
      opportunity_id
    });

    // Calculate metrics
    const prediction = {
      opportunity_id: opp.id,
      conversion_probability: Math.min(opp.conversion_probability || 0, 100),
      ltv_estimate: calculateLTV(opp, activities),
      churn_risk: calculateChurnRisk(opp, activities),
      contact_frequency: getOptimalContactFrequency(opp),
      next_contact_window: getNextContactWindow(opp, activities)
    };

    return Response.json(prediction);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateLTV(opp, activities) {
  // Base LTV = deal value + estimated expansion
  let ltv = opp.deal_value || 0;
  
  // Activity engagement increases LTV
  const engagementBonus = Math.min(activities.length * 0.05 * ltv, ltv);
  
  // Conversion probability weights it
  const probability = (opp.conversion_probability || 50) / 100;
  
  return Math.round(ltv * probability + engagementBonus);
}

function calculateChurnRisk(opp, activities) {
  let risk = 0;
  
  // Inactivity
  if (activities.length === 0) {
    risk += 30;
  } else {
    const lastActivity = new Date(Math.max(...activities.map(a => new Date(a.created_date))));
    const daysSinceActivity = Math.floor((Date.now() - lastActivity) / (1000 * 60 * 60 * 24));
    
    if (daysSinceActivity > 30) risk += 30;
    else if (daysSinceActivity > 14) risk += 15;
  }
  
  // Score drop
  const leadScore = opp.lead_score || 0;
  if (leadScore < 30) risk += 25;
  else if (leadScore < 50) risk += 10;
  
  // Stage stuck
  const stageProgression = ['prospect', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
  const currentStage = stageProgression.indexOf(opp.pipeline_stage || 'prospect');
  
  if (currentStage < 2 && activities.length > 5) {
    risk += 15; // Many activities but no progress
  }
  
  return Math.min(risk, 100);
}

function getOptimalContactFrequency(opp) {
  const score = opp.lead_score || 0;
  
  if (score >= 70) return '2x per week';
  if (score >= 50) return '1x per week';
  if (score >= 30) return '2x per month';
  return '1x per month';
}

function getNextContactWindow(opp, activities) {
  const score = opp.lead_score || 0;
  let daysUntilContact = 7;
  
  if (score >= 70) daysUntilContact = 3;
  else if (score >= 50) daysUntilContact = 7;
  else if (score >= 30) daysUntilContact = 14;
  else daysUntilContact = 30;
  
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + daysUntilContact);
  
  return nextDate.toISOString().split('T')[0];
}