import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Backup automático de relatórios
 * Executado via automation (diária ou semanal)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Lista todos os reports de todos os tenants
    const allReports = await base44.asServiceRole.entities.Report.list();
    const now = new Date().toISOString();
    
    // Filtra relatórios gerados nos últimos 7 dias
    const recentReports = allReports.filter(r => {
      const generatedDate = new Date(r.generated_at);
      const daysAgo = (new Date() - generatedDate) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    });

    // Cria registro de backup para cada report
    for (const report of recentReports) {
      await base44.asServiceRole.entities.AuditLog.create({
        tenant_id: report.tenant_id,
        user_email: 'system@backup',
        action: 'export',
        entity_type: 'Report',
        entity_id: report.id,
        new_values: { file_url: report.file_url, report_name: report.report_name },
        ip_address: '0.0.0.0',
        user_agent: 'backup-service',
        status: 'success',
        timestamp: now
      });
    }

    // Cria notificação admin
    const tenantIds = [...new Set(recentReports.map(r => r.tenant_id))];
    for (const tenantId of tenantIds) {
      await base44.asServiceRole.entities.Notification.create({
        tenant_id: tenantId,
        user_email: 'admin@backup',
        title: '💾 Backup de Relatórios',
        message: `${recentReports.filter(r => r.tenant_id === tenantId).length} relatórios foi feito backup`,
        type: 'info',
        priority: 'low',
        is_read: false,
        status: 'pending'
      });
    }

    return Response.json({ 
      success: true, 
      backedupReports: recentReports.length,
      timestamp: now 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});