import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      customer_id,
      loyalty_program_id,
      points_change,
      source,
      reference_id,
      description
    } = await req.json();

    if (!customer_id || !loyalty_program_id || points_change === undefined || !source) {
      return Response.json({
        error: 'Missing required fields: customer_id, loyalty_program_id, points_change, source'
      }, { status: 400 });
    }

    // Fetch current customer points
    const customerPointsList = await base44.entities.CustomerPoints.filter({
      id: customer_id,
      workspace_id: user.workspace_id || 'default'
    });

    if (!customerPointsList || customerPointsList.length === 0) {
      return Response.json({ error: 'Customer points record not found' }, { status: 404 });
    }

    const customerPoints = customerPointsList[0];

    // Validate sufficient balance for redemption (negative points_change)
    if (points_change < 0) {
      const newBalance = customerPoints.current_points + points_change;
      if (newBalance < 0) {
        return Response.json({
          success: false,
          error: 'Insufficient points balance',
          current_balance: customerPoints.current_points,
          requested_redemption: Math.abs(points_change),
          deficit: Math.abs(newBalance)
        }, { status: 400 });
      }
    }

    // Fetch loyalty program to check tier multiplier
    const programList = await base44.entities.LoyaltyProgram.filter({
      id: loyalty_program_id,
      workspace_id: user.workspace_id || 'default'
    });

    if (!programList || programList.length === 0) {
      return Response.json({ error: 'Loyalty program not found' }, { status: 404 });
    }

    const program = programList[0];

    // Calculate actual points change with tier bonus (only for earnings, not redemptions)
    let actualPointsChange = points_change;
    let tierBonus = 0;

    if (points_change > 0 && customerPoints.tier) {
      // Find tier multiplier
      const tier = program.tiers?.find(t => t.name === customerPoints.tier);
      const multiplier = tier?.bonus_multiplier || 1;
      tierBonus = Math.floor(points_change * (multiplier - 1));
      actualPointsChange = points_change + tierBonus;
    }

    // Calculate new balances
    const newCurrentPoints = customerPoints.current_points + actualPointsChange;
    const newLifetimePoints = customerPoints.lifetime_points + (points_change > 0 ? actualPointsChange : 0);
    const newRedeemed = customerPoints.points_redeemed + (points_change < 0 ? Math.abs(actualPointsChange) : 0);

    // Update CustomerPoints
    await base44.entities.CustomerPoints.update(customer_id, {
      current_points: newCurrentPoints,
      lifetime_points: newLifetimePoints,
      points_redeemed: newRedeemed,
      last_activity_date: new Date().toISOString().split('T')[0]
    });

    // Update LoyaltyProgram totals
    const newProgramTotalIssued = program.total_points_issued + (points_change > 0 ? actualPointsChange : 0);
    const newProgramTotalRedeemed = program.total_points_redeemed + (points_change < 0 ? Math.abs(actualPointsChange) : 0);

    await base44.entities.LoyaltyProgram.update(loyalty_program_id, {
      total_points_issued: newProgramTotalIssued,
      total_points_redeemed: newProgramTotalRedeemed
    });

    // Create audit entry (if audit table exists)
    // This is optional - can be implemented later with AuditLog entity

    return Response.json({
      success: true,
      transaction_id: `TXN_${Date.now()}_${customer_id}`,
      customer_id: customer_id,
      previous_balance: customerPoints.current_points,
      points_change: points_change,
      tier_bonus: tierBonus,
      actual_points_change: actualPointsChange,
      new_balance: newCurrentPoints,
      lifetime_points: newLifetimePoints,
      source: source,
      reference_id: reference_id,
      timestamp: new Date().toISOString(),
      message: `Transaction successful. New balance: ${newCurrentPoints} points${tierBonus > 0 ? ` (+${tierBonus} tier bonus)` : ''}`
    });
  } catch (error) {
    console.error('Error executing points transaction:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});