import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Migração de User Schema para multitenant
 * Atribui workspace_id e user_type a usuários existentes
 * Requer SuperAdmin (tenant_id = 'superadmin')
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Apenas SuperAdmin pode executar
    if (user.role !== 'admin' || user.email !== 'admin@base44.io') {
      return Response.json(
        { error: 'Apenas SuperAdmin pode executar migração de Users' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, workspace_id, user_type } = body;

    const results = {
      timestamp: new Date().toISOString(),
      action,
      results: []
    };

    // ACTION 1: List all users sem workspace_id
    if (action === 'list_orphaned') {
      try {
        const allUsers = await base44.asServiceRole.entities.User.list();
        const orphaned = allUsers.filter(u => !u.workspace_id || !u.user_type);

        results.results = {
          total_users: allUsers.length,
          orphaned_count: orphaned.length,
          orphaned_list: orphaned.map(u => ({
            id: u.id,
            email: u.email,
            full_name: u.full_name,
            role: u.role,
            workspace_id: u.workspace_id || 'NOT_SET',
            user_type: u.user_type || 'NOT_SET'
          }))
        };

        return Response.json(results);
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    }

    // ACTION 2: Atribuir user_type baseado em role
    if (action === 'assign_by_role') {
      try {
        const allUsers = await base44.asServiceRole.entities.User.list();
        const orphaned = allUsers.filter(u => !u.user_type);

        let updated = 0;
        const errors = [];

        for (const u of orphaned) {
          try {
            // admin users -> internal
            // regular users -> client
            const assignedType = u.role === 'admin' ? 'internal' : 'client';

            await base44.asServiceRole.entities.User.update(u.id, {
              user_type: assignedType
            });
            updated++;
          } catch (err) {
            errors.push({
              email: u.email,
              error: err.message
            });
          }
        }

        results.results = {
          total_orphaned: orphaned.length,
          updated,
          failed: errors.length,
          errors: errors.slice(0, 5)
        };

        return Response.json(results);
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    }

    // ACTION 3: Atribuir workspace_id baseado em workspace_id fornecido
    if (action === 'assign_workspace') {
      if (!workspace_id) {
        return Response.json(
          { error: 'workspace_id requerida' },
          { status: 400 }
        );
      }

      try {
        const allUsers = await base44.asServiceRole.entities.User.list();
        const orphaned = allUsers.filter(u => !u.workspace_id);

        let updated = 0;
        const errors = [];

        for (const u of orphaned) {
          try {
            await base44.asServiceRole.entities.User.update(u.id, {
              workspace_id: workspace_id
            });
            updated++;
          } catch (err) {
            errors.push({
              email: u.email,
              error: err.message
            });
          }
        }

        results.results = {
          total_orphaned: orphaned.length,
          workspace_id_assigned: workspace_id,
          updated,
          failed: errors.length,
          errors: errors.slice(0, 5)
        };

        return Response.json(results);
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    }

    return Response.json(
      { error: 'Unknown action. Use list_orphaned, assign_by_role, ou assign_workspace' },
      { status: 400 }
    );
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});