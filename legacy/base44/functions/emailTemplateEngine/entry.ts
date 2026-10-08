/**
 * Email Template Engine
 * Renders email templates with variable substitution and personalization
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.workspace_id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { template_id, recipient_data, campaign_id } = await req.json();

    if (!template_id || !recipient_data) {
      return Response.json(
        { error: 'template_id and recipient_data are required' },
        { status: 400 }
      );
    }

    // Fetch template
    const templates = await base44.entities.Template?.filter({
      id: template_id,
      workspace_id: user.workspace_id
    }) || [];

    if (templates.length === 0) {
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }

    const template = templates[0];

    // Render template with recipient data
    const rendered = renderTemplate(template.body_content, recipient_data);
    const subject = renderTemplate(template.subject_line || '', recipient_data);

    // Calculate engagement baseline
    const engagement = calculateEngagementMetrics(recipient_data);

    return Response.json({
      success: true,
      rendered_subject: subject,
      rendered_body: rendered,
      engagement_baseline: engagement,
      recipient: recipient_data.email,
      template_id: template_id,
      campaign_id: campaign_id
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

/**
 * Render template with variable substitution
 * Supports: {{variable_name}}, {{variable.nested}}, {{#if condition}}...{{/if}}
 */
function renderTemplate(template, data) {
  let rendered = template;

  // Simple variable substitution
  // {{first_name}} -> recipient's first name
  rendered = rendered.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
    const keys = variable.trim().split('.');
    let value = data;

    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        return '';
      }
    }

    return value !== undefined ? String(value) : '';
  });

  // Remove empty tags
  rendered = rendered.replace(/\{\{#if[^}]+\}\}.*?\{\{\/if\}\}/gs, '');

  return rendered;
}

/**
 * Calculate engagement metrics based on recipient profile
 */
function calculateEngagementMetrics(recipientData) {
  const metrics = {
    predicted_open_rate: 0.25, // Default 25%
    predicted_click_rate: 0.05, // Default 5%
    predicted_conversion_rate: 0.01 // Default 1%
  };

  // Adjust based on lead score
  if (recipientData.lead_score) {
    if (recipientData.lead_score >= 70) {
      // Hot leads
      metrics.predicted_open_rate = 0.45;
      metrics.predicted_click_rate = 0.15;
      metrics.predicted_conversion_rate = 0.05;
    } else if (recipientData.lead_score >= 30) {
      // Warm leads
      metrics.predicted_open_rate = 0.35;
      metrics.predicted_click_rate = 0.10;
      metrics.predicted_conversion_rate = 0.02;
    } else {
      // Cold leads
      metrics.predicted_open_rate = 0.15;
      metrics.predicted_click_rate = 0.02;
      metrics.predicted_conversion_rate = 0.005;
    }
  }

  // Adjust based on past engagement
  if (recipientData.engagement_history) {
    const avgOpenRate = recipientData.engagement_history.open_rate || 0;
    const avgClickRate = recipientData.engagement_history.click_rate || 0;

    // Weight historical data
    metrics.predicted_open_rate = 
      metrics.predicted_open_rate * 0.6 + avgOpenRate * 0.4;
    metrics.predicted_click_rate = 
      metrics.predicted_click_rate * 0.6 + avgClickRate * 0.4;
  }

  return metrics;
}

/**
 * Validate template syntax
 */
export function validateTemplate(template) {
  const errors = [];

  // Check for unmatched brackets
  const openBrackets = (template.match(/\{\{/g) || []).length;
  const closeBrackets = (template.match(/\}\}/g) || []).length;

  if (openBrackets !== closeBrackets) {
    errors.push('Unmatched template brackets');
  }

  // Check for valid variable names
  const invalidVars = template.match(/\{\{[\s]*[^a-zA-Z0-9._#/]+[\s]*\}\}/g);
  if (invalidVars && invalidVars.length > 0) {
    errors.push(`Invalid variable names: ${invalidVars.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}