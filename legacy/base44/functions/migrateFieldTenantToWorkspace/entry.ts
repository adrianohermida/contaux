import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Migração: tenant_id → workspace_id
 * Move o valor de tenant_id para workspace_id em entidades
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return Response.json(
        { error: 'Apenas administradores' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, entity_name } = body;

    const results = {
      timestamp: new Date().toISOString(),
      action,
      entity: entity_name,
      results: []
    };

    // ACTION 1: Diagnosticar registros com tenant_id
    if (action === 'diagnose') {
      const entities = ['Client', 'Invoice', 'Payment', 'Quote', 'Ticket', 'LegalProcess'];

      for (const entity of entities) {
        try {
          const records = await base44.entities[entity].list();
          const withTenantId = records.filter(r => r.data?.tenant_id);
          const withWorkspaceId = records.filter(r => r.data?.workspace_id);

          results.results.push({
            entity,
            total: records.length,
            with_tenant_id: withTenantId.length,
            with_workspace_id: withWorkspaceId.length,
            sample_tenant_ids: withTenantId.slice(0, 2).map(r => r.data?.tenant_id)
          });
        } catch (err) {
          results.results.push({
            entity,
            error: err.message
          });
        }
      }

      return Response.json(results);
    }

    // ACTION 2: Migrar tenant_id → workspace_id
    if (action === 'migrate') {
      if (!entity_name) {
        return Response.json(
          { error: 'entity_name obrigatorio' },
          { status: 400 }
        );
      }

      try {
        const records = await base44.entities[entity_name].list();
        const toMigrate = records.filter(r => r.data?.tenant_id && !r.data?.workspace_id);

        let updated = 0;
        const errors = [];

        for (const record of toMigrate) {
          try {
            const updateData = { ...record.data };
            updateData.workspace_id = updateData.tenant_id;
            // Manter tenant_id para backward compatibility
            
            await base44.entities[entity_name].update(record.id, updateData);
            updated++;
          } catch (err) {
            errors.push({
              id: record.id,
              error: err.message
            });
          }
        }

        results.results = {
          total_to_migrate: toMigrate.length,
          migrated: updated,
          failed: errors.length,
          errors: errors.slice(0, 3)
        };

        return Response.json(results);
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    }

    return Response.json(
      { error: 'Unknown action. Use diagnose ou migrate' },
      { status: 400 }
    );
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});