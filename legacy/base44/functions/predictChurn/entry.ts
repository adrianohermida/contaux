import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspace_id } = await req.json();
    
    if (!workspace_id) {
      return Response.json({ error: 'Missing workspace_id' }, { status: 400 });
    }

    // Fetch contacts and related data
    const contacts = await base44.asServiceRole.entities.Client.filter({
      workspace_id
    });

    if (!contacts || contacts.length === 0) {
      return Response.json({ predictions: [] });
    }

    // Fetch activities, invoices, tickets for analysis
    const activities = await base44.asServiceRole.entities.ContactActivity.filter({
      workspace_id
    });
    const invoices = await base44.asServiceRole.entities.Invoice.filter({
      workspace_id
    });
    const tickets = await base44.asServiceRole.entities.Ticket.filter({
      workspace_id
    });

    const predictions = contacts.map(contact => {
      // Calculate health trend (35%)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      
      const recent = activities.filter(a => 
        a.contact_id === contact.id && 
        new Date(a.created_date) > thirtyDaysAgo
      ).length;
      
      const previous = activities.filter(a => 
        a.contact_id === contact.id && 
        new Date(a.created_date) > sixtyDaysAgo && 
        new Date(a.created_date) <= thirtyDaysAgo
      ).length;

      const engagementTrend = previous > 0 ? (recent / previous) : 1;
      const healthTrendScore = Math.max(0, 100 - (Math.abs(1 - engagementTrend) * 50));

      // Engagement metrics (25%)
      const daysSinceActivity = recent > 0 ? 0 : 45;
      const engagementScore = Math.max(0, 100 - (daysSinceActivity * 2));

      // Payment health (20%)
      const contactInvoices = invoices.filter(inv => inv.contact_id === contact.id);
      let paymentScore = 80;
      if (contactInvoices.length > 0) {
        const overdueCount = contactInvoices.filter(inv => inv.status === 'overdue').length;
        paymentScore = Math.max(0, 100 - (overdueCount * 20));
      }

      // Support interactions (15%)
      const contactTickets = tickets.filter(t => t.contact_id === contact.id);
      let supportScore = 80;
      if (contactTickets.length > 0) {
        const unresolved = contactTickets.filter(t => t.status !== 'resolved').length;
        supportScore = Math.max(0, 100 - (unresolved * 15));
      }

      // Usage patterns (5%)
      const usageScore = recent > 5 ? 90 : recent > 2 ? 60 : 30;

      // Calculate weighted churn risk (inverse of health)
      const churnRiskScore = Math.round(
        ((100 - healthTrendScore) * 0.35) +
        ((100 - engagementScore) * 0.25) +
        ((100 - paymentScore) * 0.20) +
        ((100 - supportScore) * 0.15) +
        ((100 - usageScore) * 0.05)
      );

      // Determine risk level
      let riskLevel = 'low';
      let trend = 'stable';
      if (churnRiskScore >= 70) riskLevel = 'critical';
      else if (churnRiskScore >= 50) riskLevel = 'high';
      else if (churnRiskScore >= 30) riskLevel = 'medium';

      if (engagementTrend < 0.7) trend = 'increasing';
      else if (engagementTrend > 1.3) trend = 'decreasing';

      // Risk factors
      const factors = [];
      if (healthTrendScore < 50) factors.push('Health score decline');
      if (engagementScore < 40) factors.push('Low engagement');
      if (paymentScore < 70) factors.push('Payment issues');
      if (supportScore < 70) factors.push('Support concerns');
      if (usageScore < 50) factors.push('Low usage');

      // Predict churn date (in ~45 days for high risk)
      const churnDate = new Date();
      churnDate.setDate(churnDate.getDate() + Math.max(30, 90 - (churnRiskScore / 100) * 60));

      let recommendation = '';
      if (riskLevel === 'critical') {
        recommendation = 'URGENT: Schedule immediate intervention call';
      } else if (riskLevel === 'high') {
        recommendation = 'Send personalized retention offer within 7 days';
      } else if (riskLevel === 'medium') {
        recommendation = 'Increase touchpoints and monitor engagement';
      } else {
        recommendation = 'Continue regular monitoring';
      }

      return {
        contact_id: contact.id,
        churn_risk_score: churnRiskScore,
        risk_factors: factors,
        trend,
        risk_level: riskLevel,
        recommendation,
        predicted_churn_date: churnDate.toISOString().split('T')[0],
        health_trend: Math.round(healthTrendScore),
        engagement_score: Math.round(engagementScore),
        payment_score: Math.round(paymentScore),
        support_score: Math.round(supportScore)
      };
    });

    return Response.json({ predictions });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});