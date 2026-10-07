import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Função para corrigir workspace_id em dados órfãos do seu próprio workspace
 * Apenas admin do workspace pode executar
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Apenas admin ou user_internal pode executar
    if (user.role !== 'admin') {
      return Response.json(
        { error: 'Apenas administradores podem executar esta função' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, entity_name, workspace_id_value } = body;

    if (!action) {
      return Response.json({ error: 'Action requerida (validate ou migrate)' }, { status: 400 });
    }

    const workspaceId = workspace_id_value || user.workspace_id;

    const results = {
      timestamp: new Date().toISOString(),
      user: user.email,
      workspace_id: workspaceId,
      action,
      results: []
    };

    // VALIDATE: Identificar registros orphaned
    if (action === 'validate') {
      const entitiesCheck = [
        'Client', 'Invoice', 'Payment', 'Quote', 'Ticket', 'LegalProcess'
      ];

      for (const entity of entitiesCheck) {
        try {
          const records = await base44.entities[entity].filter({
            workspace_id: workspaceId
          });

          const orphaned = records.filter(r => !r.workspace_id);

          results.results.push({
            entity,
            total: records.length,
            with_workspace_id: records.length - orphaned.length,
            orphaned_count: orphaned.length,
            orphaned_ids: orphaned.slice(0, 5).map(r => r.id),
            status: orphaned.length === 0 ? '✅' : '⚠️'
          });
        } catch (err) {
          results.results.push({
            entity,
            error: err.message,
            status: '❌'
          });
        }
      }

      return Response.json(results);
    }

    // MIGRATE: Adicionar workspace_id aos registros orphaned
    if (action === 'migrate') {
      if (!entity_name) {
        return Response.json(
          { error: 'entity_name requerida para migration' },
          { status: 400 }
        );
      }

      try {
        // Buscar TODOS os registros (não filtrar por workspace_id)
        const records = await base44.entities[entity_name].list();

        // Filtrar apenas órfãos (sem workspace_id)
        const orphaned = records.filter(r => !r.workspace_id);

        if (orphaned.length === 0) {
          return Response.json({
            message: 'Nenhum registro orphaned encontrado',
            entity: entity_name,
            workspace_id: workspaceId
          });
        }

        let updated = 0;
        const errors = [];

        for (const record of orphaned) {
          try {
            await base44.entities[entity_name].update(record.id, {
              workspace_id: workspaceId
            });
            updated++;
          } catch (err) {
            errors.push({
              id: record.id,
              error: err.message
            });
          }
        }

        results.results = {
          entity: entity_name,
          total_orphaned: orphaned.length,
          updated,
          failed: errors.length,
          errors: errors.slice(0, 5)
        };

        return Response.json(results);
      } catch (err) {
        return Response.json(
          { error: err.message, entity: entity_name },
          { status: 500 }
        );
      }
    }

    return Response.json(
      { error: 'Unknown action. Use validate ou migrate' },
      { status: 400 }
    );
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});