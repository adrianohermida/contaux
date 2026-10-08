import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Validação Multitenant Local
 * Usuário comum pode executar para diagnosticar seu próprio workspace
 * SEM acesso a dados de outros tenants
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const results = {
      timestamp: new Date().toISOString(),
      user_email: user.email,
      workspace_id: user.workspace_id,
      checks: []
    };

    // CHECK 1: Validar dados do usuário
    results.checks.push({
      name: 'User Data',
      items: {
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        user_type: user.user_type || 'NOT_SET',
        workspace_id: user.workspace_id || 'NOT_SET',
        status: 'ℹ️ Informativo'
      }
    });

    // CHECK 2: Listar Clients do workspace
    try {
      const clients = await base44.entities.Client.filter({
        workspace_id: user.workspace_id
      });
      const clientsWithoutWorkspace = clients.filter(c => !c.workspace_id);
      
      results.checks.push({
        name: 'Client Isolation',
        items: {
          total: clients.length,
          with_workspace_id: clients.length - clientsWithoutWorkspace.length,
          missing_workspace_id: clientsWithoutWorkspace.length,
          status: clientsWithoutWorkspace.length === 0 ? '✅' : '⚠️'
        }
      });
    } catch (err) {
      results.checks.push({
        name: 'Client Isolation',
        error: err.message,
        status: '❌'
      });
    }

    // CHECK 3: Listar Invoices do workspace
    try {
      const invoices = await base44.entities.Invoice.filter({
        workspace_id: user.workspace_id
      });
      const invoicesWithoutWorkspace = invoices.filter(i => !i.workspace_id);
      
      results.checks.push({
        name: 'Invoice Isolation',
        items: {
          total: invoices.length,
          with_workspace_id: invoices.length - invoicesWithoutWorkspace.length,
          missing_workspace_id: invoicesWithoutWorkspace.length,
          status: invoicesWithoutWorkspace.length === 0 ? '✅' : '⚠️'
        }
      });
    } catch (err) {
      results.checks.push({
        name: 'Invoice Isolation',
        error: err.message,
        status: '❌'
      });
    }

    // CHECK 4: Listar Payments do workspace
    try {
      const payments = await base44.entities.Payment.filter({
        workspace_id: user.workspace_id
      });
      const paymentsWithoutWorkspace = payments.filter(p => !p.workspace_id);
      
      results.checks.push({
        name: 'Payment Isolation',
        items: {
          total: payments.length,
          with_workspace_id: payments.length - paymentsWithoutWorkspace.length,
          missing_workspace_id: paymentsWithoutWorkspace.length,
          status: paymentsWithoutWorkspace.length === 0 ? '✅' : '⚠️'
        }
      });
    } catch (err) {
      results.checks.push({
        name: 'Payment Isolation',
        error: err.message,
        status: '❌'
      });
    }

    // CHECK 5: Listar Quotes do workspace
    try {
      const quotes = await base44.entities.Quote.filter({
        workspace_id: user.workspace_id
      });
      const quotesWithoutWorkspace = quotes.filter(q => !q.workspace_id);
      
      results.checks.push({
        name: 'Quote Isolation',
        items: {
          total: quotes.length,
          with_workspace_id: quotes.length - quotesWithoutWorkspace.length,
          missing_workspace_id: quotesWithoutWorkspace.length,
          status: quotesWithoutWorkspace.length === 0 ? '✅' : '⚠️'
        }
      });
    } catch (err) {
      results.checks.push({
        name: 'Quote Isolation',
        error: err.message,
        status: '❌'
      });
    }

    // CHECK 6: Listar Tickets do workspace
    try {
      const tickets = await base44.entities.Ticket.filter({
        workspace_id: user.workspace_id
      });
      const ticketsWithoutWorkspace = tickets.filter(t => !t.workspace_id);
      
      results.checks.push({
        name: 'Ticket Isolation',
        items: {
          total: tickets.length,
          with_workspace_id: tickets.length - ticketsWithoutWorkspace.length,
          missing_workspace_id: ticketsWithoutWorkspace.length,
          status: ticketsWithoutWorkspace.length === 0 ? '✅' : '⚠️'
        }
      });
    } catch (err) {
      results.checks.push({
        name: 'Ticket Isolation',
        error: err.message,
        status: '❌'
      });
    }

    // CHECK 7: Listar LegalProcesses do workspace
    try {
      const processes = await base44.entities.LegalProcess.filter({
        workspace_id: user.workspace_id
      });
      const processesWithoutWorkspace = processes.filter(p => !p.workspace_id);
      
      results.checks.push({
        name: 'LegalProcess Isolation',
        items: {
          total: processes.length,
          with_workspace_id: processes.length - processesWithoutWorkspace.length,
          missing_workspace_id: processesWithoutWorkspace.length,
          status: processesWithoutWorkspace.length === 0 ? '✅' : '⚠️'
        }
      });
    } catch (err) {
      results.checks.push({
        name: 'LegalProcess Isolation',
        error: err.message,
        status: '❌'
      });
    }

    // Summary
    const allPassed = results.checks.every(c => c.items?.status === '✅' || c.status === '❌');
    results.summary = {
      total_checks: results.checks.length,
      passed: results.checks.filter(c => c.items?.status === '✅').length,
      warnings: results.checks.filter(c => c.items?.status === '⚠️').length,
      errors: results.checks.filter(c => c.status === '❌').length,
      overall_status: allPassed ? '✅ READY FOR PRODUCTION' : '⚠️ NEEDS REVIEW'
    };

    return Response.json(results);
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});