import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Alert Management System - PHASE 14.3
 * Multi-channel alerting with deduplication and intelligent routing
 */

class AlertManager {
  constructor() {
    this.alerts = new Map();
    this.cooldownPeriod = 5 * 60 * 1000; // 5 min cooldown to prevent spam
    this.alertThresholds = {
      critical: { timeout: 1000, channels: ['email', 'slack', 'sms'] },
      warning: { timeout: 2000, channels: ['email', 'slack'] },
      info: { timeout: 5000, channels: ['slack'] },
    };
  }

  /**
   * Create alert from anomaly
   */
  createAlert(anomaly) {
    const alertId = `${anomaly.type}_${Date.now()}`;
    
    return {
      id: alertId,
      type: anomaly.type,
      severity: anomaly.severity,
      message: anomaly.message,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      channels: this.alertThresholds[anomaly.severity].channels,
    };
  }

  /**
   * Check if alert should be sent (deduplication)
   */
  shouldSendAlert(alertType, severity) {
    const key = `${alertType}_${severity}`;
    const lastAlert = this.alerts.get(key);
    
    if (!lastAlert) return true;
    
    const timeSinceLastAlert = Date.now() - lastAlert.timestamp;
    return timeSinceLastAlert > this.cooldownPeriod;
  }

  /**
   * Send alert to channels
   */
  async sendAlert(alert) {
    const results = {};

    for (const channel of alert.channels) {
      try {
        switch (channel) {
          case 'email':
            results.email = await this.sendEmailAlert(alert);
            break;
          case 'slack':
            results.slack = await this.sendSlackAlert(alert);
            break;
          case 'sms':
            results.sms = await this.sendSmsAlert(alert);
            break;
        }
      } catch (error) {
        results[channel] = { success: false, error: error.message };
      }
    }

    return results;
  }

  /**
   * Send email alert
   */
  async sendEmailAlert(alert) {
    try {
      // In real implementation, would call email service
      console.log(`📧 Email alert sent: ${alert.message}`);
      return { success: true, channel: 'email' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send Slack alert
   */
  async sendSlackAlert(alert) {
    try {
      const color = {
        critical: '#FF0000',
        warning: '#FFA500',
        info: '#0000FF',
      }[alert.severity];

      // In real implementation, would call Slack webhook
      console.log(`💬 Slack alert: [${alert.severity.toUpperCase()}] ${alert.message}`);
      
      return { success: true, channel: 'slack', timestamp: Date.now() };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send SMS alert (critical only)
   */
  async sendSmsAlert(alert) {
    try {
      if (alert.severity !== 'critical') {
        return { success: false, reason: 'SMS only for critical alerts' };
      }

      // In real implementation, would call SMS service (Twilio, etc)
      console.log(`📱 SMS alert: ${alert.message}`);
      
      return { success: true, channel: 'sms', timestamp: Date.now() };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Track alert in cooldown
   */
  trackAlert(alertType, severity) {
    const key = `${alertType}_${severity}`;
    this.alerts.set(key, { timestamp: Date.now(), severity });
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit = 50) {
    return Array.from(this.alerts.entries())
      .slice(-limit)
      .map(([key, value]) => ({
        key,
        ...value,
      }));
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId) {
    // In real implementation, would update alert status
    console.log(`✅ Alert acknowledged: ${alertId}`);
    return { success: true };
  }
}

/**
 * Backend handler for alert management
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

    const { action, anomalies = [], alertId } = await req.json();

    const alertManager = new AlertManager();

    switch (action) {
      case 'create-alerts':
        const alerts = [];
        const sendResults = [];

        for (const anomaly of anomalies) {
          if (alertManager.shouldSendAlert(anomaly.type, anomaly.severity)) {
            const alert = alertManager.createAlert(anomaly);
            alerts.push(alert);
            
            const result = await alertManager.sendAlert(alert);
            sendResults.push({ alert, result });
            
            alertManager.trackAlert(anomaly.type, anomaly.severity);
          }
        }

        return Response.json({
          success: true,
          alerts_created: alerts.length,
          alerts_sent: sendResults.length,
          results: sendResults,
        });

      case 'acknowledge-alert':
        const ack = alertManager.acknowledgeAlert(alertId);
        return Response.json({ success: true, ...ack });

      case 'get-history':
        const history = alertManager.getAlertHistory(50);
        return Response.json({ success: true, history });

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

export { AlertManager };