import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspace_id, contact_id, churn_risk_score, risk_level } = await req.json();
    
    if (!workspace_id || !contact_id || churn_risk_score === undefined) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Determine intervention strategy based on risk level
    const interventions = [];

    if (risk_level === 'critical') {
      // Critical: Multiple urgent interventions
      interventions.push({
        type: 'priority_call',
        description: 'Schedule immediate priority support call',
        timing: 'immediate',
        impact_score: 0.85,
        priority: 1
      });

      interventions.push({
        type: 'loyalty_discount',
        description: 'Offer 25% loyalty discount on next purchase',
        value: 25,
        timing: 'immediate',
        impact_score: 0.65,
        priority: 2
      });

      interventions.push({
        type: 'feature_upgrade',
        description: 'Offer 3-month free premium feature upgrade',
        timing: 'same_day',
        impact_score: 0.70,
        priority: 3
      });
    } else if (risk_level === 'high') {
      // High: Strong interventions
      interventions.push({
        type: 'personalized_email',
        description: 'Send personalized retention email with case studies',
        timing: 'within_24h',
        impact_score: 0.55,
        priority: 1
      });

      interventions.push({
        type: 'loyalty_discount',
        description: 'Offer 15% loyalty discount',
        value: 15,
        timing: 'within_48h',
        impact_score: 0.50,
        priority: 2
      });

      interventions.push({
        type: 'account_review',
        description: 'Schedule account health review call',
        timing: 'within_week',
        impact_score: 0.45,
        priority: 3
      });
    } else if (risk_level === 'medium') {
      // Medium: Preventive interventions
      interventions.push({
        type: 'check_in_email',
        description: 'Send friendly check-in email',
        timing: 'within_3days',
        impact_score: 0.40,
        priority: 1
      });

      interventions.push({
        type: 'loyalty_discount',
        description: 'Offer 10% early loyalty discount',
        value: 10,
        timing: 'within_week',
        impact_score: 0.35,
        priority: 2
      });
    } else {
      // Low: Monitoring interventions
      interventions.push({
        type: 'engagement_content',
        description: 'Share relevant product tips and best practices',
        timing: 'weekly',
        impact_score: 0.25,
        priority: 1
      });
    }

    // Calculate predicted retention rate
    const baseRetentionRate = (100 - churn_risk_score) / 100;
    const interventionBoost = interventions.reduce((sum, i) => sum + i.impact_score, 0) * 0.15;
    const predictedRetentionRate = Math.min(0.95, baseRetentionRate + interventionBoost);

    return Response.json({
      contact_id,
      risk_level,
      churn_risk_score,
      interventions: interventions.sort((a, b) => a.priority - b.priority),
      predicted_retention_rate: Math.round(predictedRetentionRate * 100),
      estimated_impact: Math.round(interventionBoost * 100),
      recommended_budget: interventions.filter(i => i.value).reduce((sum, i) => sum + (i.value || 0), 0)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});