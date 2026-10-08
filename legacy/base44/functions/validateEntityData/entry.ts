/**
 * Entity Data Validation
 * Server-side validation for all entity CRUD operations
 */

import { z } from 'npm:zod@3.24.2';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Entity validation schemas
const schemas = {
  Client: z.object({
    workspace_id: z.string().min(1),
    company_name: z.string().min(2).max(255),
    email: z.string().email(),
    phone: z.string().optional(),
    cpf: z.string().optional(),
    cnpj: z.string().optional(),
    status: z.enum(['active', 'inactive', 'suspended', 'cancelled']).default('active'),
  }),

  Invoice: z.object({
    workspace_id: z.string().min(1),
    contact_id: z.string().min(1),
    invoice_number: z.string().min(1).max(50),
    issue_date: z.string().datetime(),
    due_date: z.string().datetime(),
    total_amount: z.number().min(0),
    status: z.enum(['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled']).default('draft'),
    items: z.array(z.object({
      description: z.string().min(1),
      quantity: z.number().min(1),
      unit_price: z.number().min(0),
    })).min(1),
  }),

  Quote: z.object({
    workspace_id: z.string().min(1),
    contact_id: z.string().min(1),
    quote_number: z.string().min(1).max(50),
    quote_date: z.string().date(),
    valid_until: z.string().date(),
    items: z.array(z.object({
      description: z.string().min(1),
      quantity: z.number().min(1),
      unit_price: z.number().min(0),
    })).min(1),
    status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'converted', 'expired']).default('draft'),
  }),

  Payment: z.object({
    workspace_id: z.string().min(1),
    invoice_id: z.string().min(1),
    contact_id: z.string().min(1),
    amount: z.number().min(0.01),
    payment_date: z.string().date(),
    payment_method: z.enum(['bank_transfer', 'credit_card', 'debit_card', 'cash', 'check', 'pix', 'other']),
    status: z.enum(['pending', 'confirmed', 'failed', 'refunded', 'disputed']).default('pending'),
  }),

  SalesOpportunity: z.object({
    workspace_id: z.string().min(1),
    contact_id: z.string().min(1),
    opportunity_name: z.string().min(2).max(255),
    deal_value: z.number().min(0),
    pipeline_stage: z.enum(['prospect', 'qualified', 'proposal', 'negotiation', 'won', 'lost']).default('prospect'),
    expected_close_date: z.string().date().optional(),
  }),
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const { entityType, data, operation } = await req.json();

    if (!entityType || !data) {
      return Response.json(
        { error: 'Missing entityType or data' },
        { status: 400 }
      );
    }

    const schema = schemas[entityType];
    if (!schema) {
      return Response.json(
        { error: `Unknown entity type: ${entityType}` },
        { status: 400 }
      );
    }

    // Validate data
    const result = schema.safeParse(data);

    if (!result.success) {
      return Response.json({
        valid: false,
        errors: result.error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    // Additional business logic validation
    if (entityType === 'Invoice') {
      // Verify contact exists and belongs to workspace
      const contact = await base44.entities.Client.filter({
        workspace_id: data.workspace_id,
        id: data.contact_id,
      }, null, 1);

      if (contact.length === 0) {
        return Response.json({
          valid: false,
          errors: [{ path: 'contact_id', message: 'Contact not found' }],
        });
      }

      // Verify due_date > issue_date
      if (new Date(data.due_date) <= new Date(data.issue_date)) {
        return Response.json({
          valid: false,
          errors: [{ path: 'due_date', message: 'Due date must be after issue date' }],
        });
      }
    }

    if (entityType === 'Payment') {
      // Verify invoice exists
      const invoice = await base44.entities.Invoice.filter({
        workspace_id: data.workspace_id,
        id: data.invoice_id,
      }, null, 1);

      if (invoice.length === 0) {
        return Response.json({
          valid: false,
          errors: [{ path: 'invoice_id', message: 'Invoice not found' }],
        });
      }

      // Verify payment amount <= invoice amount
      if (data.amount > (invoice[0].total_amount || 0)) {
        return Response.json({
          valid: false,
          errors: [{ path: 'amount', message: 'Payment exceeds invoice amount' }],
        });
      }
    }

    return Response.json({ valid: true, data: result.data });
  } catch (error) {
    console.error('Validation error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});