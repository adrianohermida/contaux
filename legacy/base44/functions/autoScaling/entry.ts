import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Auto-scaling Engine - PHASE 14.3
 * Predicts and executes scaling based on metrics and policies
 */

class AutoScaler {
  constructor() {
    this.policies = {
      cpu: {
        scale_up: { threshold: 70, duration: 120, replicas: 1 },
        scale_down: { threshold: 30, duration: 300, replicas: -1 },
        min_replicas: 2,
        max_replicas: 10,
      },
      memory: {
        scale_up: { threshold: 75, duration: 60, replicas: 2 },
        scale_down: { threshold: 40, duration: 600, replicas: -1 },
      },
      latency: {
        scale_up: { threshold: 200, duration: 30, replicas: 2 },
        scale_down: { threshold: 100, duration: 300, replicas: -1 },
      },
      traffic: {
        scale_up: { rps_increase_percent: 50, replicas: 0.5 }, // Scale by 50% of current
      },
    };
    this.scalingHistory = [];
  }

  /**
   * Calculate target replicas based on metrics
   */
  calculateTargetReplicas(currentReplicas, metrics) {
    let targetReplicas = currentReplicas;
    const decisions = [];

    // CPU-based scaling
    const cpuTotal = metrics.infrastructure.cpu.user_percent + metrics.infrastructure.cpu.system_percent;
    if (cpuTotal > this.policies.cpu.scale_up.threshold) {
      targetReplicas += this.policies.cpu.scale_up.replicas;
      decisions.push({ reason: 'high_cpu', cpuUsage: cpuTotal });
    } else if (cpuTotal < this.policies.cpu.scale_down.threshold) {
      targetReplicas -= this.policies.cpu.scale_down.replicas;
      decisions.push({ reason: 'low_cpu', cpuUsage: cpuTotal });
    }

    // Memory-based scaling
    const memoryPercent = (metrics.infrastructure.memory.heap_used_mb / metrics.infrastructure.memory.heap_limit_mb) * 100;
    if (memoryPercent > this.policies.memory.scale_up.threshold) {
      targetReplicas += this.policies.memory.scale_up.replicas;
      decisions.push({ reason: 'high_memory', memoryUsage: memoryPercent });
    } else if (memoryPercent < this.policies.memory.scale_down.threshold) {
      targetReplicas -= this.policies.memory.scale_down.replicas;
      decisions.push({ reason: 'low_memory', memoryUsage: memoryPercent });
    }

    // Latency-based scaling
    if (metrics.performance.query_latency.p99 > this.policies.latency.scale_up.threshold) {
      targetReplicas += this.policies.latency.scale_up.replicas;
      decisions.push({ reason: 'high_latency', p99: metrics.performance.query_latency.p99 });
    }

    // Enforce min/max bounds
    targetReplicas = Math.max(this.policies.cpu.min_replicas, Math.min(this.policies.cpu.max_replicas, targetReplicas));

    return { targetReplicas, decisions };
  }

  /**
   * Execute scaling
   */
  async executeScaling(currentReplicas, targetReplicas, reason = '') {
    if (targetReplicas === currentReplicas) {
      return { scaled: false, reason: 'no_change_needed' };
    }

    const direction = targetReplicas > currentReplicas ? 'up' : 'down';
    const difference = Math.abs(targetReplicas - currentReplicas);

    const scalingEvent = {
      timestamp: new Date().toISOString(),
      from_replicas: currentReplicas,
      to_replicas: targetReplicas,
      direction,
      difference,
      reason,
    };

    this.scalingHistory.push(scalingEvent);

    // In real implementation, would call Kubernetes or container orchestration API
    console.log(`🚀 Scaling ${direction}: ${currentReplicas} → ${targetReplicas} replicas`);

    return {
      scaled: true,
      ...scalingEvent,
    };
  }

  /**
   * Predict future scaling needs
   */
  predictScaling(metrics, historicalMetrics) {
    const trend = this.calculateTrend(historicalMetrics);

    let prediction = {
      will_scale_up: false,
      will_scale_down: false,
      recommended_replicas: 0,
      confidence: 0,
    };

    // If trending up, likely need scale-up in 5-10 minutes
    if (trend.cpu_trending_up && trend.cpu_change_rate > 2) {
      prediction.will_scale_up = true;
      prediction.confidence = 0.85;
    }

    // If trending down, likely need scale-down in 10+ minutes
    if (trend.cpu_trending_down && trend.cpu_change_rate < -1) {
      prediction.will_scale_down = true;
      prediction.confidence = 0.70;
    }

    return prediction;
  }

  /**
   * Calculate trend from historical data
   */
  calculateTrend(historicalMetrics) {
    if (historicalMetrics.length < 2) {
      return { cpu_trending_up: false, cpu_trending_down: false, cpu_change_rate: 0 };
    }

    const recent = historicalMetrics.slice(-5);
    const cpuValues = recent.map(m => m.cpu_percent || 0);
    const changeRate = (cpuValues[cpuValues.length - 1] - cpuValues[0]) / cpuValues[0];

    return {
      cpu_trending_up: changeRate > 0,
      cpu_trending_down: changeRate < 0,
      cpu_change_rate: changeRate,
    };
  }

  /**
   * Get scaling history
   */
  getScalingHistory(limit = 50) {
    return this.scalingHistory.slice(-limit);
  }
}

/**
 * Backend handler for auto-scaling
 */
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'POST required' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.workspace_id || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, metrics, currentReplicas = 3, historicalMetrics = [] } = await req.json();

    const scaler = new AutoScaler();

    switch (action) {
      case 'calculate-target':
        const { targetReplicas, decisions } = scaler.calculateTargetReplicas(currentReplicas, metrics);
        return Response.json({
          success: true,
          current_replicas: currentReplicas,
          target_replicas: targetReplicas,
          decisions,
        });

      case 'execute-scaling':
        const scalingResult = await scaler.executeScaling(currentReplicas, metrics.target_replicas, metrics.reason);
        return Response.json({ success: true, ...scalingResult });

      case 'predict':
        const prediction = scaler.predictScaling(metrics, historicalMetrics);
        return Response.json({ success: true, prediction });

      case 'get-history':
        const history = scaler.getScalingHistory(50);
        return Response.json({ success: true, history });

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

export { AutoScaler };