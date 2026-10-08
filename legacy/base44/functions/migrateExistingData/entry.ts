import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Função de migração: Adiciona workspace_id aos registros existentes
 * Executar UMA VEZ para validar dados pré-multitenancy
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Apenas SuperAdmin pode executar
    if (user?.tenant_id !== 'superadmin' || user?.role !== 'admin') {
      return Response.json({ error: 'SuperAdmin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { action, entity_name, target_workspace_id } = body;

    // Ação 1: Validar isolamento
    if (action === 'validate_isolation') {
      const result = {
        timestamp: new Date().toISOString(),
        checks: []
      };

      // Verificar registros sem workspace_id
      const noWorkspaceRecords = [];
      const entitiesChecked = ['Client', 'Invoice', 'Payment', 'Quote', 'Ticket', 'LegalProcess'];

      for (const entity of entitiesChecked) {
        try {
          const records = await base44.asServiceRole.entities[entity].list();
          const missing = records.filter(r => !r.workspace_id);
          if (missing.length > 0) {
            noWorkspaceRecords.push({
              entity,
              count: missing.length,
              ids: missing.slice(0, 5).map(r => r.id)
            });
          }
          result.checks.push({
            entity,
            total: records.length,
            with_workspace_id: records.filter(r => r.workspace_id).length,
            missing_workspace_id: missing.length,
            status: missing.length === 0 ? '✅' : '⚠️'
          });
        } catch (err) {
          result.checks.push({
            entity,
            error: err.message,
            status: '❌'
          });
        }
      }

      result.summary = {
        total_checks: result.checks.length,
        passed: result.checks.filter(c => c.status === '✅').length,
        issues_found: noWorkspaceRecords.length > 0
      };

      return Response.json(result);
    }

    // Ação 2: Migrar registros (assign workspace_id para registros órfãos)
    if (action === 'migrate_records') {
      if (!entity_name || !target_workspace_id) {
        return Response.json(
          { error: 'entity_name e target_workspace_id são obrigatórios' },
          { status: 400 }
        );
      }

      const records = await base44.asServiceRole.entities[entity_name].list();
      const orphaned = records.filter(r => !r.workspace_id);

      let updated = 0;
      const errors = [];

      for (const record of orphaned) {
        try {
          await base44.asServiceRole.entities[entity_name].update(record.id, {
            workspace_id: target_workspace_id
          });
          updated++;
        } catch (err) {
          errors.push({ id: record.id, error: err.message });
        }
      }

      return Response.json({
        entity: entity_name,
        total_orphaned: orphaned.length,
        updated,
        failed: errors.length,
        errors: errors.slice(0, 5)
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});