/**
 * Execute Campaign Function
 * Sends campaign messages to recipients based on type and template
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.workspace_id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { campaign_id } = await req.json();

    if (!campaign_id) {
      return Response.json({ error: 'campaign_id is required' }, { status: 400 });
    }

    // Fetch campaign
    const campaigns = await base44.entities.Campaign.filter({
      id: campaign_id,
      workspace_id: user.workspace_id
    });

    if (!campaigns || campaigns.length === 0) {
      return Response.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const campaign = campaigns[0];

    // Validate campaign status
    if (!['draft', 'scheduled'].includes(campaign.status)) {
      return Response.json(
        { error: `Campaign must be in draft or scheduled status, current: ${campaign.status}` },
        { status: 400 }
      );
    }

    // Get recipients
    let recipientIds = campaign.recipient_list || [];

    // Apply segment filters if any
    if (campaign.target_segment !== 'all_contacts') {
      const clients = await base44.entities.Client.filter({
        workspace_id: user.workspace_id
      });

      recipientIds = filterRecipientsBySegment(clients, campaign.target_segment);
    }

    const recipientCount = recipientIds.length;

    if (recipientCount === 0) {
      return Response.json({ error: 'No recipients found' }, { status: 400 });
    }

    // Track sending
    const deliveryStatus = {
      pending: recipientCount,
      sent: 0,
      failed: 0,
      bounced: 0
    };

    // Update campaign to active
    await base44.entities.Campaign.update(campaign_id, {
      status: 'active',
      start_date: new Date().toISOString(),
      recipient_count: recipientCount,
      delivery_status: deliveryStatus
    });

    // Queue campaign execution (async)
    executeAsync(base44, campaign, recipientIds, user.workspace_id);

    return Response.json({
      success: true,
      campaign_id: campaign_id,
      recipients_count: recipientCount,
      status: 'Campaign execution started'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

/**
 * Filter recipients by segment
 */
function filterRecipientsBySegment(clients, segment) {
  if (!clients) return [];

  switch (segment) {
    case 'hot_leads':
      return clients
        .filter(c => c.lead_score >= 70)
        .map(c => c.id);

    case 'warm_leads':
      return clients
        .filter(c => c.lead_score >= 30 && c.lead_score < 70)
        .map(c => c.id);

    case 'cold_leads':
      return clients
        .filter(c => c.lead_score < 30)
        .map(c => c.id);

    case 'recent_activity':
      return clients
        .filter(c => {
          if (!c.last_activity_date) return false;
          const daysSince = Math.floor(
            (Date.now() - new Date(c.last_activity_date)) / (1000 * 60 * 60 * 24)
          );
          return daysSince <= 7;
        })
        .map(c => c.id);

    default:
      return clients.map(c => c.id);
  }
}

/**
 * Async campaign execution (would be handled by queue/worker in production)
 */
async function executeAsync(base44, campaign, recipientIds, workspaceId) {
  try {
    const batchSize = 100;
    let sentCount = 0;
    let failedCount = 0;

    // Process in batches
    for (let i = 0; i < recipientIds.length; i += batchSize) {
      const batch = recipientIds.slice(i, i + batchSize);

      for (const recipientId of batch) {
        try {
          // Get recipient details
          const recipients = await base44.entities.Client.filter({
            id: recipientId,
            workspace_id: workspaceId
          });

          if (!recipients || recipients.length === 0) {
            failedCount++;
            continue;
          }

          const recipient = recipients[0];

          // Send based on campaign type
          if (campaign.type === 'email') {
            await sendEmail(base44, campaign, recipient);
            sentCount++;
          } else if (campaign.type === 'sms') {
            await sendSMS(base44, campaign, recipient);
            sentCount++;
          }
        } catch (err) {
          failedCount++;
          console.error(`Failed to send to recipient ${recipientId}:`, err.message);
        }
      }

      // Update progress
      await base44.entities.Campaign.update(campaign.id, {
        sent_count: sentCount,
        delivery_status: {
          pending: recipientIds.length - sentCount - failedCount,
          sent: sentCount,
          failed: failedCount,
          bounced: 0
        }
      });
    }

    // Mark as completed
    await base44.entities.Campaign.update(campaign.id, {
      status: 'completed',
      end_date: new Date().toISOString(),
      sent_count: sentCount
    });
  } catch (error) {
    console.error('Campaign execution error:', error);
  }
}

/**
 * Send email to recipient
 */
async function sendEmail(base44, campaign, recipient) {
  // In production, integrate with email service (SendGrid, AWS SES, etc.)
  // For now, just log the action
  console.log(`Sending email to ${recipient.email}: ${campaign.subject_line}`);

  // Would call email API here
  // await base44.integrations.Core.SendEmail({
  //   to: recipient.email,
  //   subject: campaign.subject_line,
  //   body: campaign.body_content
  // });
}

/**
 * Send SMS to recipient
 */
async function sendSMS(base44, campaign, recipient) {
  // In production, integrate with SMS service (Twilio, etc.)
  console.log(`Sending SMS to ${recipient.phone}: ${campaign.body_content}`);

  // Would call SMS API here
}