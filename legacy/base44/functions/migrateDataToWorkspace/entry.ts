import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Migração de dados órfãos para workspace_id correto
 * Busca workspaces e atribui dados órfãos
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Apenas admin pode executar
    if (user.role !== 'admin') {
      return Response.json(
        { error: 'Apenas administradores podem executar' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, workspace_id } = body;

    if (!workspace_id && action === 'migrate') {
      return Response.json(
        { error: 'workspace_id requerida' },
        { status: 400 }
      );
    }

    const results = {
      timestamp: new Date().toISOString(),
      action,
      workspace_id: workspace_id || user.workspace_id,
      results: []
    };

    const targetWorkspaceId = workspace_id || user.workspace_id;

    // Entidades críticas a migrar
    const entities = ['Client', 'Invoice', 'Payment', 'Quote', 'Ticket', 'LegalProcess'];

    for (const entity of entities) {
      try {
        const records = await base44.entities[entity].list();
        const orphaned = records.filter(r => !r.workspace_id);

        if (orphaned.length === 0) {
          results.results.push({
            entity,
            status: '✅',
            total: records.length,
            orphaned_count: 0
          });
          continue;
        }

        let updated = 0;
        const errors = [];

        for (const record of orphaned) {
          try {
            await base44.entities[entity].update(record.id, {
              workspace_id: targetWorkspaceId
            });
            updated++;
          } catch (err) {
            errors.push({
              id: record.id,
              error: err.message
            });
          }
        }

        results.results.push({
          entity,
          status: errors.length === 0 ? '✅' : '⚠️',
          total: records.length,
          orphaned_count: orphaned.length,
          migrated: updated,
          failed: errors.length,
          sample_errors: errors.slice(0, 2)
        });
      } catch (err) {
        results.results.push({
          entity,
          status: '❌',
          error: err.message
        });
      }
    }

    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});