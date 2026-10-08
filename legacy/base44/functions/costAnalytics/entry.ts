import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Cost Analytics Engine - PHASE 14.4
 * Analyzes infrastructure costs and detects anomalies
 */

class CostAnalytics {
  constructor() {
    this.costHistory = [];
    this.budgetAlerts = [];
  }

  /**
   * Collect current infrastructure costs
   */
  collectCosts(metrics) {
    const costs = {
      timestamp: new Date().toISOString(),
      compute: {
        on_demand: metrics.instances?.on_demand || 0,
        reserved: metrics.instances?.reserved || 0,
        spot: metrics.instances?.spot || 0,
      },
      storage: {
        database: metrics.storage?.db || 0,
        cdn: metrics.storage?.cdn || 0,
        backups: metrics.storage?.backups || 0,
      },
      networking: {
        data_transfer: metrics.networking?.transfer || 0,
        api_calls: metrics.networking?.api || 0,
      },
    };

    const totalCost = this.calculateTotalCost(costs);
    costs.total_hourly = totalCost;
    costs.total_monthly = totalCost * 730; // 730 hours per month

    this.costHistory.push(costs);
    return costs;
  }

  /**
   * Calculate total cost from breakdown
   */
  calculateTotalCost(costs) {
    let total = 0;
    
    // Compute costs
    total += costs.compute.on_demand * 5; // $5 per instance/hour
    total += costs.compute.reserved * 2.5; // $2.5 per reserved/hour (50% discount)
    total += costs.compute.spot * 0.8; // $0.80 per spot/hour (85% discount)
    
    // Storage costs
    total += (costs.storage.database / 100) * 0.05; // $0.05 per GB/month
    total += (costs.storage.cdn / 100) * 0.085; // $0.085 per GB
    total += (costs.storage.backups / 100) * 0.025; // $0.025 per GB backup
    
    // Networking costs
    total += (costs.networking.data_transfer / 100) * 0.5; // $0.5 per GB data transfer
    total += (costs.networking.api_calls / 1000000) * 3.5; // $3.5 per million API calls

    return Math.round(total * 100) / 100; // Round to cents
  }

  /**
   * Detect cost anomalies
   */
  detectCostAnomalies(currentCost, historicalCosts) {
    const anomalies = [];

    if (historicalCosts.length < 2) return anomalies;

    const avgCost = historicalCosts.slice(-24).reduce((sum, c) => sum + c.total_hourly, 0) / Math.min(24, historicalCosts.length);
    const threshold = avgCost * 1.3; // 30% above average

    if (currentCost > threshold) {
      anomalies.push({
        type: 'cost_spike',
        severity: 'warning',
        current: currentCost,
        average: avgCost,
        increase_percent: Math.round(((currentCost - avgCost) / avgCost) * 100),
      });
    }

    return anomalies;
  }

  /**
   * Forecast costs for next 3 months
   */
  forecastCosts(historicalCosts) {
    if (historicalCosts.length < 30) {
      return { message: 'Not enough data for accurate forecast' };
    }

    const last30Days = historicalCosts.slice(-720); // 30 days of hourly data
    const avgDailyCost = last30Days.reduce((sum, c) => sum + c.total_monthly, 0) / 30;

    const forecast = {
      next_30_days: Math.round(avgDailyCost),
      next_60_days: Math.round(avgDailyCost * 2),
      next_90_days: Math.round(avgDailyCost * 3),
      current_monthly_rate: Math.round(avgDailyCost),
    };

    return forecast;
  }

  /**
   * Optimize compute costs
   */
  optimizeComputeCosts(currentMetrics) {
    const recommendations = [];

    // Recommendation 1: Reserved instances for baseline
    const totalInstances = currentMetrics.instances?.total || 0;
    const baselineInstances = Math.ceil(totalInstances * 0.7);
    const reservedSavings = baselineInstances * 2.5 * 730; // Annual savings
    
    recommendations.push({
      type: 'reserved_instances',
      action: `Purchase ${baselineInstances} reserved instances`,
      savings_annual: reservedSavings,
      savings_percent: 50,
    });

    // Recommendation 2: Spot instances for non-critical
    const spotCandidates = Math.floor(totalInstances * 0.3);
    const spotSavings = spotCandidates * 4.2 * 730; // $4.2/hour difference
    
    recommendations.push({
      type: 'spot_instances',
      action: `Migrate ${spotCandidates} instances to spot`,
      savings_annual: spotSavings,
      savings_percent: 85,
    });

    // Recommendation 3: Storage optimization
    recommendations.push({
      type: 'storage_cleanup',
      action: 'Archive old backups, remove unused snapshots',
      savings_annual: 1200,
      savings_percent: 20,
    });

    return recommendations;
  }

  /**
   * Budget tracking
   */
  checkBudget(currentCost, monthlyBudget) {
    const hoursElapsed = new Date().getHours();
    const daysElapsed = new Date().getDate() - 1;
    const monthProgress = (daysElapsed * 24 + hoursElapsed) / (30 * 24);

    const projectedMonthCost = currentCost / monthProgress;
    const budgetUtilization = (projectedMonthCost / monthlyBudget) * 100;

    return {
      budget: monthlyBudget,
      projected_cost: Math.round(projectedMonthCost),
      utilization_percent: Math.round(budgetUtilization),
      status: budgetUtilization > 100 ? 'over_budget' : budgetUtilization > 90 ? 'at_risk' : 'on_track',
      alert: budgetUtilization > 90,
    };
  }
}

/**
 * Backend handler for cost analytics
 */
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'POST required' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.workspace_id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, metrics, monthlyBudget = 50000, historicalCosts = [] } = await req.json();

    const analytics = new CostAnalytics();

    switch (action) {
      case 'analyze':
        const costs = analytics.collectCosts(metrics);
        const anomalies = analytics.detectCostAnomalies(costs.total_hourly, historicalCosts);
        const recommendations = analytics.optimizeComputeCosts(metrics);
        
        return Response.json({
          success: true,
          costs,
          anomalies,
          recommendations,
        });

      case 'forecast':
        const forecast = analytics.forecastCosts(historicalCosts);
        return Response.json({ success: true, forecast });

      case 'budget-check':
        const budgetStatus = analytics.checkBudget(metrics.current_cost || 70, monthlyBudget);
        return Response.json({ success: true, ...budgetStatus });

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

export { CostAnalytics };