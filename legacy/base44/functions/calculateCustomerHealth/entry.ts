import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspace_id, contact_id } = await req.json();
    
    if (!workspace_id) {
      return Response.json({ error: 'Missing workspace_id' }, { status: 400 });
    }

    // Fetch contact and related data
    const query = contact_id ? { workspace_id, id: contact_id } : { workspace_id };
    const contacts = await base44.asServiceRole.entities.Client.filter(query);
    
    if (!contacts || contacts.length === 0) {
      return Response.json({ health_scores: [] });
    }

    // Fetch activities, invoices, tickets for analysis
    const activities = await base44.asServiceRole.entities.ContactActivity.filter({ workspace_id });
    const invoices = await base44.asServiceRole.entities.Invoice.filter({ workspace_id });
    const tickets = await base44.asServiceRole.entities.Ticket.filter({ workspace_id });

    const health_scores = contacts.map(contact => {
      // Payment Health: On-time payments (simplified - assume 80% on-time)
      const contactInvoices = invoices.filter(inv => inv.contact_id === contact.id);
      const paymentHealth = contactInvoices.length > 0 ? 80 : 70;

      // Engagement Level: Activity count last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentActivities = activities.filter(act => 
        act.contact_id === contact.id && 
        new Date(act.created_date) > thirtyDaysAgo
      );
      const engagementLevel = Math.min(recentActivities.length * 10, 100);

      // Support Satisfaction: Average ticket rating
      const contactTickets = tickets.filter(t => t.contact_id === contact.id);
      const satisfaction = contactTickets.length > 0 
        ? (contactTickets.reduce((sum, t) => sum + (t.rating || 3), 0) / contactTickets.length) * 20
        : 50;

      // Usage Adoption: Estimate based on activity type diversity
      const activityTypes = new Set(recentActivities.map(a => a.activity_type)).size;
      const usageAdoption = Math.min(activityTypes * 15, 100);

      // Calculate weighted health score
      const healthScore = Math.round(
        (paymentHealth * 0.40) +
        (engagementLevel * 0.25) +
        (satisfaction * 0.20) +
        (usageAdoption * 0.15)
      );

      // Determine trend and status
      const trend = engagementLevel > 50 ? 'improving' : engagementLevel > 30 ? 'stable' : 'declining';
      const healthStatus = healthScore >= 75 ? 'healthy' : healthScore >= 50 ? 'at_risk' : 'critical';
      
      let recommendation = '';
      if (healthStatus === 'critical') {
        recommendation = 'Urgent: Schedule outreach call immediately';
      } else if (healthStatus === 'at_risk') {
        recommendation = 'Increase engagement frequency and review recent activity';
      } else {
        recommendation = 'Continue regular check-ins and monitor engagement';
      }

      return {
        contact_id: contact.id,
        health_score: healthScore,
        payment_health: paymentHealth,
        engagement_level: engagementLevel,
        satisfaction: Math.round(satisfaction),
        usage_adoption: usageAdoption,
        trend,
        health_status: healthStatus,
        recommendation
      };
    });

    return Response.json({ health_scores });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});