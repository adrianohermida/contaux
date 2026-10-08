/**
 * Update Invoice Payment Status
 * Backend function to sync payment status with invoice
 * Automatically called when payment is confirmed
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invoiceId, tenantId } = await req.json();

    if (!invoiceId || !tenantId) {
      return Response.json({ 
        error: 'Missing required fields: invoiceId, tenantId' 
      }, { status: 400 });
    }

    // Fetch invoice
    const invoice = await base44.asServiceRole.entities.Invoice.get(invoiceId);
    
    if (!invoice || invoice.tenant_id !== tenantId) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Fetch all confirmed payments for this invoice
    const payments = await base44.asServiceRole.entities.Payment.filter({
      invoice_id: invoiceId,
      status: 'confirmed'
    });

    // Calculate total paid
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    
    // Determine new status
    let newStatus = invoice.status;
    
    if (totalPaid >= invoice.total_amount) {
      newStatus = 'paid';
    } else if (totalPaid > 0) {
      // Remains as is (invoice can be partial)
      newStatus = invoice.status;
    } else {
      // No payments confirmed yet
      if (new Date(invoice.due_date) < new Date() && invoice.status !== 'paid') {
        newStatus = 'overdue';
      }
    }

    // Update invoice
    await base44.asServiceRole.entities.Invoice.update(invoiceId, {
      paid_amount: totalPaid,
      status: newStatus
    });

    // Log the update
    if (payments.length > 0 && user.email) {
      await base44.asServiceRole.entities.AuditLog.create({
        workspace_id: tenantId,
        user_email: user.email,
        action: 'update',
        entity_type: 'Invoice',
        entity_id: invoiceId,
        entity_name: invoice.invoice_number,
        new_values: {
          paid_amount: totalPaid,
          status: newStatus,
          updated_payments: payments.length
        },
        status: 'success'
      });
    }

    return Response.json({
      success: true,
      invoice: {
        id: invoiceId,
        paid_amount: totalPaid,
        status: newStatus,
        remaining_balance: Math.max(0, invoice.total_amount - totalPaid)
      }
    });

  } catch (error) {
    console.error('Error updating invoice payment status:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});