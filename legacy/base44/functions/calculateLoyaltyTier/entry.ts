import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customer_id, loyalty_program_id, lifetime_points } = await req.json();

    if (!customer_id || !loyalty_program_id || lifetime_points === undefined) {
      return Response.json({
        error: 'Missing required fields: customer_id, loyalty_program_id, lifetime_points'
      }, { status: 400 });
    }

    // Fetch loyalty program to get tier configuration
    const programs = await base44.entities.LoyaltyProgram.filter({
      id: loyalty_program_id,
      workspace_id: user.workspace_id || 'default'
    });

    if (!programs || programs.length === 0) {
      return Response.json({ error: 'Loyalty program not found' }, { status: 404 });
    }

    const program = programs[0];

    // If program doesn't use tiers, return default tier
    if (!program.tier_system || !program.tiers || program.tiers.length === 0) {
      return Response.json({
        success: true,
        tier: 'Member',
        lifetime_points: lifetime_points,
        benefits: ['Standard member benefits'],
        bonus_multiplier: 1
      });
    }

    // Sort tiers by min_points (descending) to find matching tier
    const sortedTiers = [...program.tiers].sort((a, b) => b.min_points - a.min_points);

    // Find the highest tier that customer qualifies for
    let matchedTier = sortedTiers[sortedTiers.length - 1]; // Default to lowest tier
    for (const tier of sortedTiers) {
      if (lifetime_points >= tier.min_points) {
        matchedTier = tier;
        break;
      }
    }

    // Calculate progress to next tier
    const currentTierIndex = sortedTiers.indexOf(matchedTier);
    let nextTierThreshold = null;
    let progressToNextTier = 0;

    if (currentTierIndex > 0) {
      const nextTier = sortedTiers[currentTierIndex - 1];
      nextTierThreshold = nextTier.min_points;
      const progressRange = nextTierThreshold - matchedTier.min_points;
      const currentProgress = lifetime_points - matchedTier.min_points;
      progressToNextTier = (currentProgress / progressRange) * 100;
    }

    // Update CustomerPoints with tier
    await base44.entities.CustomerPoints.update(customer_id, {
      tier: matchedTier.name
    });

    return Response.json({
      success: true,
      tier: matchedTier.name,
      lifetime_points: lifetime_points,
      benefits: matchedTier.benefits || [],
      bonus_multiplier: matchedTier.bonus_multiplier || 1,
      next_tier_threshold: nextTierThreshold,
      progress_to_next_tier: Math.round(progressToNextTier),
      message: `Customer promoted to ${matchedTier.name} tier`
    });
  } catch (error) {
    console.error('Error calculating loyalty tier:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});