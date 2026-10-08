/**
 * Validate Sales Opportunity Data
 * Server-side validation for opportunity creation and updates
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { opportunity_data, workspace_id } = await req.json();

    if (!opportunity_data || !workspace_id) {
      return Response.json({ error: 'Missing opportunity_data or workspace_id' }, { status: 400 });
    }

    const errors = [];

    // Validate required fields
    if (!opportunity_data.contact_id) {
      errors.push('contact_id is required');
    }

    if (!opportunity_data.opportunity_name || opportunity_data.opportunity_name.trim() === '') {
      errors.push('opportunity_name is required');
    }

    if (opportunity_data.deal_value === undefined || opportunity_data.deal_value === null) {
      errors.push('deal_value is required');
    }

    // Validate deal value
    if (opportunity_data.deal_value < 0) {
      errors.push('deal_value must be greater than or equal to 0');
    }

    // Validate pipeline stage
    const validStages = ['prospect', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
    if (opportunity_data.pipeline_stage && !validStages.includes(opportunity_data.pipeline_stage)) {
      errors.push(
        `pipeline_stage must be one of: ${validStages.join(', ')}`
      );
    }

    // Validate conversion probability
    if (
      opportunity_data.conversion_probability !== undefined &&
      (opportunity_data.conversion_probability < 0 || opportunity_data.conversion_probability > 100)
    ) {
      errors.push('conversion_probability must be between 0 and 100');
    }

    // Validate lead score
    if (
      opportunity_data.lead_score !== undefined &&
      (opportunity_data.lead_score < 0 || opportunity_data.lead_score > 100)
    ) {
      errors.push('lead_score must be between 0 and 100');
    }

    // Validate dates
    if (opportunity_data.expected_close_date && opportunity_data.quote_date) {
      const closeDate = new Date(opportunity_data.expected_close_date);
      const quoteDate = new Date(opportunity_data.quote_date);

      if (closeDate < quoteDate) {
        errors.push('expected_close_date must be after opportunity creation date');
      }
    }

    // Validate contact exists
    if (opportunity_data.contact_id) {
      const contacts = await base44.entities.Client.filter({
        id: opportunity_data.contact_id,
        tenant_id: workspace_id,
      });

      if (!contacts.length) {
        errors.push('Client not found');
      }
    }

    // Validate quote exists (if provided)
    if (opportunity_data.quote_id) {
      const quotes = await base44.entities.Quote.filter({
        id: opportunity_data.quote_id,
        tenant_id: workspace_id,
      });

      if (!quotes.length) {
        errors.push('Quote not found');
      }
    }

    // Validate source
    const validSources = ['direct', 'referral', 'website', 'inbound', 'cold_call', 'other'];
    if (opportunity_data.source && !validSources.includes(opportunity_data.source)) {
      errors.push(
        `source must be one of: ${validSources.join(', ')}`
      );
    }

    // Validate is_active is boolean
    if (opportunity_data.is_active !== undefined && typeof opportunity_data.is_active !== 'boolean') {
      errors.push('is_active must be a boolean');
    }

    if (errors.length > 0) {
      return Response.json({
        valid: false,
        errors: errors,
      }, { status: 400 });
    }

    return Response.json({
      valid: true,
      errors: [],
      warning: [],
    });
  } catch (error) {
    console.error('validateSalesOpportunityData error:', error);
    return Response.json(
      { error: error.message || 'Validation failed' },
      { status: 500 }
    );
  }
});