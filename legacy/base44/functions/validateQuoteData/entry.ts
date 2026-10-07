/**
 * Validate Quote Data
 * Server-side validation for quote creation and updates
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quote_data, tenant_id } = await req.json();

    if (!quote_data || !tenant_id) {
      return Response.json({ error: 'Missing quote_data or tenant_id' }, { status: 400 });
    }

    const errors = [];

    // Validate required fields
    if (!quote_data.client_id) {
      errors.push('client_id is required');
    }

    if (!quote_data.quote_date) {
      errors.push('quote_date is required');
    }

    if (!quote_data.valid_until) {
      errors.push('valid_until is required');
    }

    // Validate dates
    if (quote_data.quote_date && quote_data.valid_until) {
      const quoteDate = new Date(quote_data.quote_date);
      const validUntil = new Date(quote_data.valid_until);
      
      if (validUntil <= quoteDate) {
        errors.push('valid_until must be after quote_date');
      }

      if (quoteDate > new Date()) {
        errors.push('quote_date cannot be in the future');
      }
    }

    // Validate items
    if (!quote_data.items || quote_data.items.length === 0) {
      errors.push('At least one item is required');
    }

    quote_data.items?.forEach((item, idx) => {
      if (!item.description) {
        errors.push(`Item ${idx + 1}: description is required`);
      }
      if (item.quantity <= 0) {
        errors.push(`Item ${idx + 1}: quantity must be greater than 0`);
      }
      if (item.unit_price < 0) {
        errors.push(`Item ${idx + 1}: unit_price cannot be negative`);
      }
    });

    // Validate discount and tax
    if (quote_data.discount_percent < 0 || quote_data.discount_percent > 100) {
      errors.push('discount_percent must be between 0 and 100');
    }

    if (quote_data.tax_percent < 0 || quote_data.tax_percent > 100) {
      errors.push('tax_percent must be between 0 and 100');
    }

    // Validate client exists
    if (quote_data.client_id) {
      const clients = await base44.entities.Client.filter({
        id: quote_data.client_id,
        tenant_id: tenant_id,
      });

      if (!clients.length) {
        errors.push('Client not found');
      }
    }

    // Validate opportunity exists (if provided)
    if (quote_data.opportunity_id) {
      const opportunities = await base44.entities.SalesOpportunity.filter({
        id: quote_data.opportunity_id,
        tenant_id: tenant_id,
      });

      if (!opportunities.length) {
        errors.push('SalesOpportunity not found');
      }
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
    });
  } catch (error) {
    console.error('validateQuoteData error:', error);
    return Response.json(
      { error: error.message || 'Validation failed' },
      { status: 500 }
    );
  }
});