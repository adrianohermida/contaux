/**
 * Calculate Lead Score
 * Calculates comprehensive lead score based on multiple factors
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { opportunity_id, workspace_id } = await req.json();

    if (!opportunity_id || !workspace_id) {
      return Response.json({ error: 'Missing opportunity_id or workspace_id' }, { status: 400 });
    }

    // Fetch opportunity
    const opportunities = await base44.entities.SalesOpportunity.filter({
      id: opportunity_id,
      workspace_id: workspace_id,
    });

    if (!opportunities.length) {
      return Response.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    const opportunity = opportunities[0];

    // Calculate lead score
    let score = 0;
    const breakdown = {
      deal_value_score: 0,
      activity_score: 0,
      pipeline_score: 0,
      probability_score: 0,
      engagement_score: 0,
    };

    // 1. Deal Value Score (0-20 points)
    if (opportunity.deal_value > 0) {
      // Scale: 10k = 20 points, 50k = 20 points max
      breakdown.deal_value_score = Math.min(20, (opportunity.deal_value / 10000) * 20);
      score += breakdown.deal_value_score;
    }

    // 2. Pipeline Stage Score (0-30 points)
    const stageScores = {
      prospect: 5,
      qualified: 15,
      proposal: 20,
      negotiation: 25,
      won: 30,
      lost: 0,
    };
    breakdown.pipeline_score = stageScores[opportunity.pipeline_stage] || 0;
    score += breakdown.pipeline_score;

    // 3. Conversion Probability Score (0-20 points)
    breakdown.probability_score = (opportunity.conversion_probability || 0) / 5; // 100% = 20 points
    score += breakdown.probability_score;

    // 4. Activity Recency Score (0-20 points)
    if (opportunity.last_activity_date) {
      const daysSinceActivity = Math.floor(
        (new Date() - new Date(opportunity.last_activity_date)) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceActivity <= 7) {
        breakdown.activity_score = 20; // Very recent
      } else if (daysSinceActivity <= 30) {
        breakdown.activity_score = 15; // Recent
      } else if (daysSinceActivity <= 60) {
        breakdown.activity_score = 10; // Somewhat recent
      } else if (daysSinceActivity <= 90) {
        breakdown.activity_score = 5; // Old
      } else {
        breakdown.activity_score = 0; // Very old
      }
    }
    score += breakdown.activity_score;

    // 5. Expected Close Date Score (0-10 points)
    if (opportunity.expected_close_date) {
      const daysToClose = Math.floor(
        (new Date(opportunity.expected_close_date) - new Date()) / (1000 * 60 * 60 * 24)
      );

      if (daysToClose <= 30) {
        breakdown.engagement_score = 10; // Very soon
      } else if (daysToClose <= 60) {
        breakdown.engagement_score = 8; // Soon
      } else if (daysToClose <= 90) {
        breakdown.engagement_score = 6; // Medium term
      } else if (daysToClose <= 180) {
        breakdown.engagement_score = 3; // Long term
      } else {
        breakdown.engagement_score = 1; // Very long term
      }
    }
    score += breakdown.engagement_score;

    // Cap score at 100
    const finalScore = Math.min(100, Math.round(score));

    // Determine category
    let category;
    if (finalScore >= 70) {
      category = 'hot'; // Ready to close
    } else if (finalScore >= 30) {
      category = 'warm'; // Actively engaged
    } else {
      category = 'cold'; // Needs nurturing
    }

    // Round breakdown scores
    Object.keys(breakdown).forEach(key => {
      breakdown[key] = Math.round(breakdown[key] * 10) / 10;
    });

    // Update opportunity with new score
    await base44.entities.SalesOpportunity.update(opportunity_id, {
      lead_score: finalScore,
    });

    return Response.json({
      success: true,
      opportunity_id: opportunity_id,
      lead_score: finalScore,
      category: category,
      score_breakdown: breakdown,
      summary: {
        total_available_points: 100,
        points_earned: finalScore,
        category_description:
          category === 'hot'
            ? 'Oportunidade quente - pronta para ser fechada'
            : category === 'warm'
            ? 'Oportunidade morna - requer engajamento'
            : 'Oportunidade fria - necessita de nutricao',
      },
    });
  } catch (error) {
    console.error('calculateLeadScore error:', error);
    return Response.json(
      { error: error.message || 'Failed to calculate lead score' },
      { status: 500 }
    );
  }
});