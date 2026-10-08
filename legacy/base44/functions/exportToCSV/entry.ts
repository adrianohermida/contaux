import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Exporta dados para CSV
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const body = await req.json();
    const { tenantId, entityType } = body;

    if (!user || user.tenant_id !== tenantId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let data = [];
    let headers = [];

    // Busca dados conforme tipo
    if (entityType === 'invoices') {
      data = await base44.entities.Invoice.filter({ tenant_id: tenantId });
      headers = ['ID', 'Número', 'Cliente', 'Data', 'Vencimento', 'Total', 'Status'];
    } else if (entityType === 'payments') {
      data = await base44.entities.Payment.filter({ tenant_id: tenantId });
      headers = ['ID', 'Referência', 'Cliente', 'Fatura', 'Valor', 'Data', 'Método', 'Status'];
    } else if (entityType === 'tickets') {
      data = await base44.entities.Ticket.filter({ tenant_id: tenantId });
      headers = ['ID', 'Número', 'Título', 'Categoria', 'Status', 'Prioridade', 'Criado'];
    } else if (entityType === 'clients') {
      data = await base44.entities.Client.filter({ tenant_id: tenantId });
      headers = ['ID', 'Empresa', 'Email', 'Telefone', 'Status'];
    }

    // Monta CSV
    let csv = headers.join(',') + '\n';

    data.forEach(item => {
      let row = [];
      if (entityType === 'invoices') {
        row = [item.id, item.invoice_number, item.client_id, item.issue_date, item.due_date, item.total_amount, item.status];
      } else if (entityType === 'payments') {
        row = [item.id, item.payment_number, item.client_id, item.invoice_id, item.amount, item.payment_date, item.payment_method, item.status];
      } else if (entityType === 'tickets') {
        row = [item.id, item.ticket_number, item.title, item.category, item.status, item.priority, item.created_date];
      } else if (entityType === 'clients') {
        row = [item.id, item.company_name, item.email, item.phone || '', item.status];
      }
      csv += row.map(v => `"${v || ''}"`.replace(/"/g, '""')).join(',') + '\n';
    });

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${entityType}_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});